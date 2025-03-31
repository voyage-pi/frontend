import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  InfoWindow,
  Marker,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const MapWithRoutesApi = ({
  center = { lat: 40.4168, lng: -3.7038 }, // default center if not passed
  polylines = [],                        // expected to be an array of { path, options, ... }
  markers = [],                          // expected to be an array of { position, title, icon, ... }
}) => {
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [duration, setDuration] = useState("");
  const mapRef = useRef(null);

  const key = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: key,
    libraries: ["places", "geometry"],
  });

  // Example mouse event handlers for polylines
  const handlePolylineMouseOver = (e, polyline) => {
    // e.latLng holds the coordinate where the mouse is over
    setInfoWindowPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });

    // If each polyline has some “duration” info in it, you could do:
    // setDuration(polyline.duration);
  };

  const handlePolylineMouseOut = () => {
    setInfoWindowPosition(null);
    setDuration("");
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={(map) => (mapRef.current = map)}
    >
      {/* Render all polylines passed in as props */}
      {polylines.map((polyline, index) => (
        <Polyline
          key={index}
          path={polyline.path}
          options={polyline.options}
          onMouseOver={(e) => handlePolylineMouseOver(e, polyline)}
          onMouseOut={handlePolylineMouseOut}
        />
      ))}

      {/* Render all markers passed in as props */}
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          title={marker.title}
          icon={marker.icon}
        />
      ))}

      {/* InfoWindow can show any polyline/marker info on hover or click */}
      {infoWindowPosition && (
        <InfoWindow position={infoWindowPosition} onCloseClick={handlePolylineMouseOut}>
          <div>
            <strong>Duração:</strong> {duration || "—"}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapWithRoutesApi;
