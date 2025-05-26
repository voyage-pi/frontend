import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Polyline,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Circle,
} from "@react-google-maps/api";
import MarkerIcon from "../assets/marker2.png";
import MapStyle from "../assets/map-style.json";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 48.8566,
  lng: 9.3517,
};
const defaultZoom = 5;

const MapComponent = ({ polylines = [], markers = [], circles = [] }) => {
  const key = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [hasElements, setHasElements] = useState(false);
  const polylineInstancesRef = useRef([]);
  const [previousMarkers, setPreviousMarkers] = useState(markers);
  const [previousPoly, setPreviousPoly] = useState(polylines);

  const { isLoaded } = useJsApiLoader({
    id: "2430af244ef47a1f",
    googleMapsApiKey: key,
    libraries: ["geometry", "places"],
  });

  useEffect(() => {
    const validMarkersCount = markers.filter(marker => marker !== null).length;
    setHasElements(validMarkersCount > 0 || polylines.length > 0);
  }, [markers, polylines]);

  // Clear all polylines
  const clearPolylines = useCallback(() => {
    if (polylineInstancesRef.current.length > 0) {
      polylineInstancesRef.current.forEach((polyline) => {
        polyline.setMap(null);
      });
      polylineInstancesRef.current = [];
    }
  }, []);

  // Add polylines to the map
  const addPolylinesToMap = useCallback(() => {
    if (!mapInstance || !window.google || !polylines.length) return;

    clearPolylines();

    polylines.forEach((polylineGroup) => {
      if (!polylineGroup.polylines) return;

      polylineGroup.polylines.forEach((polyline) => {
        if (!polyline.polylineEncoded) return;

        const path = window.google.maps.geometry.encoding.decodePath(
          polyline.polylineEncoded
        );
        const polylineInstance = new window.google.maps.Polyline({
          path: path,
          strokeColor: "#FE385C",
          strokeWeight: 4,
          map: mapInstance,
        });

        polylineInstancesRef.current.push(polylineInstance);
      });
    });
  }, [mapInstance, polylines, clearPolylines]);

  // Handle map bounds
  useEffect(() => {
    if (!mapInstance || !window.google) return;

    if (!hasElements) {
      mapInstance.setCenter(defaultCenter);
      mapInstance.setZoom(defaultZoom);
      return;
    }

    // Calculate bounds
    const bounds = new window.google.maps.LatLngBounds();
    let hasValidBounds = false;

    // Add markers to bounds
    if (markers.length > 0 && markers != previousMarkers) {
      setPreviousMarkers(markers);
      markers.forEach((marker) => {
        if (marker && marker.position && marker.position.lat && marker.position.lng) {
          bounds.extend(
            new window.google.maps.LatLng(
              marker.position.lat,
              marker.position.lng
            )
          );
          hasValidBounds = true;
        }
      });
    }
    // Add polylines to bounds
    if (polylines.length > 0 && polylines != previousPoly) {
      setPreviousPoly(polylines);
      polylines.forEach((polylineGroup) => {
        if (polylineGroup.polylines) {
          polylineGroup.polylines.forEach((polyline) => {
            if (polyline.polylineEncoded) {
              const decodedPath =
                window.google.maps.geometry.encoding.decodePath(
                  polyline.polylineEncoded
                );
              decodedPath.forEach((point) => {
                bounds.extend(point);
                hasValidBounds = true;
              });
            }
          });
        }
      });
    }

    if (hasValidBounds) {
      mapInstance.fitBounds(bounds);
      const validMarkersCount = markers.filter(marker => marker !== null).length;
      if (validMarkersCount === 1) {
        mapInstance.setZoom(9);
      }
    } else if (markers.length == 0 && polylines == 0 && circles.length === 0) {
      mapInstance.setCenter(defaultCenter);
      mapInstance.setZoom(defaultZoom);
    }

    // Update polylines
    addPolylinesToMap();
  }, [mapInstance, markers, polylines, hasElements, addPolylinesToMap]);

  // Clean up polylines when component unmounts
  useEffect(() => {
    return () => {
      clearPolylines();
    };
  }, [clearPolylines]);

  const onLoad = useCallback(function callback(map) {
    console.log("LoadingAgain");
    setMapInstance(map);
  }, []);

  const onUnmount = useCallback(
    function callback() {
      clearPolylines();
      setMapInstance(null);
    },
    [clearPolylines]
  );

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const createNumberedMarkerIcon = (number) => {
    const svg = `<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><path d="M20 48C20 48 34 29 34 20C34 12.3 27.7 6 20 6S6 12.3 6 20C6 29 20 48 20 48Z" fill="#FE385C" stroke="#D1395C" stroke-width="1"/><circle cx="20" cy="20" r="11" fill="rgba(255,255,255,0.3)"/><text x="20" y="25" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="white">${number}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const circle_options = {
    strokeColor: "#FF4F7A", // Soft brand pink for borders
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: "#FF4F7A", // Match stroke but softened with opacity
    fillOpacity: 0.2,
    draggable: false,
    editable: false,
    visible: true,
    zIndex: 2,
  };

  const renderCircles = () => {
    return circles.length !== 0 ? (
      circles.map((circle, index) => (
        <Circle
          center={circle.center}
          options={{ ...circle_options, radius: circle.radius }}
        />
      ))
    ) : (
      <></>
    );
  };
  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: MapStyle,
      }}
      zoom={defaultZoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Render only markers using React components */}
      {markers.length !== 0 &&
        markers.map((marker, index) => 
          marker ? (
            <Marker
              key={`marker-${index}`}
              position={marker.position}
              title={marker.title}
              icon={{
                url: createNumberedMarkerIcon(index + 1),
                scaledSize: new window.google.maps.Size(50, 62),
                anchor: new window.google.maps.Point(25, 60),
              }}
              onClick={() => handleMarkerClick(marker)}
            />
          ) : null
        )}
      {renderCircles()}

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="flex flex-row gap-3 max-w-xs">
            {selectedMarker.image && (
              <div className="w-16 h-16 flex-shrink-0 flex justify-center items-center rounded-md overflow-hidden">
                <img
                  src={selectedMarker.image}
                  alt="Marker"
                  className="max-w-full max-h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://picsum.photos/seed/${encodeURIComponent(
                      selectedMarker.title || "place"
                    )}/200/200`;
                  }}
                />
              </div>
            )}
            <div className="flex flex-col justify-center">
              <h3 className="mb-1 text-base font-bold">
                {selectedMarker.title}
              </h3>
              {selectedMarker.address && (
                <p className="m-0 text-sm">{selectedMarker.address}</p>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <div>Loading...</div>
  );
};

export default React.memo(MapComponent);
