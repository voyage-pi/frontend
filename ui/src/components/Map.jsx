import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};


const center = { lat: 40.4168, lng: -3.7038 }; // Madrid

const MapWithRoutesApi = () => {
  const [path, setPath] = useState(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [duration, setDuration] = useState("");
  const mapRef = useRef(null);

  const key = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: key,
    libraries: ["places", "geometry"],
  });

  const fetchRoute = async () => {
    const response = await fetch(
      `https://routes.googleapis.com/directions/v2:computeRoutes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs",
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: 40.4168,
                longitude: -3.7038,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: 40.4153,
                longitude: -3.6844,
              },
            },
          },
          travelMode: "DRIVE",
        }),
      }
    );

    const data = await response.json();

    const encoded = data.routes?.[0]?.polyline?.encodedPolyline;
    const durationSec = data.routes?.[0]?.duration;

    if (encoded && window.google?.maps?.geometry?.encoding) {
      const decodedPath = window.google.maps.geometry.encoding.decodePath(
        encoded
      );

      setPath(decodedPath);

      const durationInMin = durationSec
        ? `${Math.round(parseInt(durationSec.replace("s", "")) / 60)} min`
        : "";
      setDuration(durationInMin);
    }
  };

  const handlePolylineMouseOver = (e) => {
    setInfoWindowPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  const handlePolylineMouseOut = () => {
    setInfoWindowPosition(null);
  };

  return isLoaded ? (
    <>
      <button onClick={fetchRoute}>Obter rota</button>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={(map) => (mapRef.current = map)}
      >
        {path && (
          <Polyline
            path={path}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
            onMouseOver={handlePolylineMouseOver}
            onMouseOut={handlePolylineMouseOut}
          />
        )}
        {infoWindowPosition && (
          <InfoWindow position={infoWindowPosition}>
            <div>
              <strong>Duração:</strong> {duration}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapWithRoutesApi;
