import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
const PlaceCard = ({ id, place, time, transport, image }) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(image);

  // Fallback image if the provided one fails to load
  const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(
    place
  )}/200/200`;

  // Always update the image when the prop changes
  useEffect(() => {
    setImgSrc(image);
    setImgError(false);
  }, [image]);

  // Pre-check if the image is from Google Maps or is a problematic URL
  useEffect(() => {
    if (
      typeof image === "string" &&
      (image.includes("google.com/maps") ||
        image.includes("maps.googleapis.com") ||
        image.includes("streetviewpixels"))
    ) {
      console.log("Detected Google Maps URL, using fallback immediately");
      setImgError(true);
    }
  }, [image]);
  const delayCard=0.2

  return (
    <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -100, opacity: 0 }}
    transition={{ 
      delay: typeof id === 'number' ? delayCard * id : 0,
      duration: 0.5, 
      ease: "easeOut" 
    }}
      className="flex flex-col"
    >
      <div className="flex flex-row items-center">
        <div className="shadow-primary/20 rounded-lg p-3 pl-3 mb-4 cursor-grab bg-white shadow-md w-full">
          <div className="flex items-center">
            <div className="flex flex-col gap-1">
              {[0, 1, 2].map((row) => (
                <div key={`row-${row}`} className="flex gap-1">
                  {[0, 1].map((col) => (
                    <div
                      key={`dot-${row}-${col}`}
                      className="w-1 h-1 rounded-full bg-primary/80"
                    />
                  ))}
                </div>
              ))}
            </div>
            <img
              src={imgError ? fallbackImage : imgSrc}
              referrerPolicy="no-referrer"
              alt={place}
              className="w-20 h-20 object-cover rounded-lg mr-4 ml-4"
              onError={() => setImgError(true)}
            />
            <div className="flex-1">
              <h3 className="font-semibold">{place}</h3>
              <p className="text-sm text-gray-500">{time}</p>
              {transport && transport.type && transport.duration && (
                <p className="text-xs text-gray-400">
                  {transport.type} - {transport.duration}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {transport && transport.type && transport.duration ? (
        <p className="text-xs text-gray-400">
          {transport.type} - {transport.duration}
        </p>
      ) : (
        <p className="text-xs text-gray-400"></p>
      )}
    </motion.div>
  );
};

export default PlaceCard;
