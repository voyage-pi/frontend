import React, { useCallback, useState } from 'react';
import { GoogleMap, Polyline, Marker, useJsApiLoader } from '@react-google-maps/api';
import MarkerIcon from '../assets/marker2.png';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapComponent = ({ center, polylines, markers }) => {

  const key = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;

  const [map, setMap] = useState(null);

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
    </GoogleMap>
  ) : (
    <div>Loading...</div>
  );
};
export default React.memo(MapComponent);