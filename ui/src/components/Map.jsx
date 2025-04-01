import React, { useCallback, useState } from 'react';
import { GoogleMap, Polyline, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import MarkerIcon from '../assets/marker2.png';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapComponent = ({ center, polylines, markers }) => {
  const key = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: '2430af244ef47a1f',
    googleMapsApiKey: key,
    libraries: ['geometry', 'places']
  });

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();

    markers.forEach(marker => {
      bounds.extend(marker.position);
    });

    polylines.forEach(polylineGroup => {
      polylineGroup.polylines.forEach(polyline => {
        const decodedPath = google.maps.geometry.encoding.decodePath(polyline.polylineEncoded);
        decodedPath.forEach(point => {
          bounds.extend(point);
        });
      });
    });

    map.fitBounds(bounds);
    setMap(map);
  }, [markers, polylines]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const renderPolylines = () => {
    return polylines.map((polylineGroup, groupIndex) => {
      return polylineGroup.polylines.map((polyline, polylineIndex) => {
        const path = google.maps.geometry.encoding.decodePath(polyline.polylineEncoded);

        return (
          <Polyline
            key={`polyline-${groupIndex}-${polylineIndex}`}
            path={path}
            options={polylineGroup.options}
          />
        );
      });
    });
  };

  const renderMarkers = () => {
    return markers.map((marker, index) => (
      <Marker
        key={`marker-${index}`}
        position={marker.position}
        title={marker.title}
        icon={{
          url: MarkerIcon,
          scaledSize: new window.google.maps.Size(80, 80)
        }}
        onClick={() => handleMarkerClick(marker)}
      />
    ));
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
      zoom={13}
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