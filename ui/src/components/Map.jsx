import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, Polyline, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import MarkerIcon from '../assets/marker2.png';
import MapStyle from '../assets/map-style.json';

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default center and zoom for Europe view
const defaultCenter = {
  lat: 48.8566, // Paris latitude (roughly center of Europe)
  lng: 9.3517   // Adjusted longitude to center Europe in the view
};
const defaultZoom = 4;

const MapComponent = ({ polylines=[], markers=[] }) => {
  const key = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [hasElements, setHasElements] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: '2430af244ef47a1f',
    googleMapsApiKey: key,
    libraries: ['geometry', 'places'],
  });
  
  useEffect(() => {
    setHasElements(markers.length > 0 || polylines.length > 0);
  }, [markers, polylines]);

  useEffect(() => {
    if (!mapInstance || !window.google) return;
    
    // If no elements, just set default view and return early
    if (!hasElements) {
      mapInstance.setCenter(defaultCenter);
      mapInstance.setZoom(defaultZoom);
      return;
    }
    
    // If we have elements, calculate bounds
    const bounds = new window.google.maps.LatLngBounds();
    let hasValidBounds = false;

    // Add markers to bounds
    if (markers.length > 0) {
      markers.forEach(marker => {
        if (marker.position && marker.position.lat && marker.position.lng) {
          bounds.extend(new window.google.maps.LatLng(
            marker.position.lat, 
            marker.position.lng
          ));
          hasValidBounds = true;
        }
      });
    }

    // Add polylines to bounds
    if (polylines.length > 0) {
      polylines.forEach(polylineGroup => {
        if (polylineGroup.polylines) {
          polylineGroup.polylines.forEach(polyline => {
            if (polyline.polylineEncoded) {
              const decodedPath = window.google.maps.geometry.encoding.decodePath(polyline.polylineEncoded);
              decodedPath.forEach(point => {
                bounds.extend(point);
                hasValidBounds = true;
              });
            }
          });
        }
      });
    }

    // If we found valid bounds, fit the map to them
    if (hasValidBounds) {
      mapInstance.fitBounds(bounds);
      // Optional: adjust zoom after fitting bounds
      mapInstance.setZoom(Math.min(mapInstance.getZoom(), 8));
    } else {
      // Fallback to default view if we have elements but couldn't calculate bounds
      mapInstance.setCenter(defaultCenter);
      mapInstance.setZoom(defaultZoom);
    }
  }, [mapInstance, markers, polylines, hasElements]);

  const onLoad = useCallback(function callback(map) {
    setMapInstance(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMapInstance(null);
  }, []);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const renderPolylines = () => {
    return polylines.length!==0 ? polylines.map((polylineGroup, groupIndex) => {
      return polylineGroup.polylines.map((polyline, polylineIndex) => {
        const path = window.google.maps.geometry.encoding.decodePath(polyline.polylineEncoded);

        return (
          <Polyline
            key={`polyline-${groupIndex}-${polylineIndex}`}
            path={path}
            options={{
              strokeColor: "#FE385C",
              strokeWeight: 4,
            }}
          />
        );
      });
    }) : <></>;
  };

  const renderMarkers = () => {
    return markers.length!==0 ? markers.map((marker, index) => (
      <Marker
        key={`marker-${index}`}
        position={marker.position}
        title={marker.title}
        icon={{
          url: MarkerIcon,
          scaledSize: new window.google.maps.Size(100, 100),
        }}
        onClick={() => handleMarkerClick(marker)}
      />
    )): <></>;
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}  // Always provide a default center
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: MapStyle
      }}
      zoom={defaultZoom}  // Always provide a default zoom
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {renderPolylines()}
      {renderMarkers()}

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
                    e.target.src = `https://picsum.photos/seed/${encodeURIComponent(selectedMarker.title || 'place')}/200/200`;
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