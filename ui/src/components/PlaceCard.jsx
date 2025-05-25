import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TfiReload } from "react-icons/tfi";
import { HiOutlineTrash } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

const PlaceCard = ({
  id,
  place,
  time,
  transport,
  image,
  onRefresh,
  onDelete,
  road = false,
  refreshing = false,
  onClick,
  participants
  
}) => {
  const { LoggedUser } = useAuth();
  
  // Check if user is a participant (remove console logs)
  const isParticipant =
    (!LoggedUser && (!participants || participants.length === 0)) || // Allow editing for guest-created trips only when not logged in
    (LoggedUser &&
      participants &&
      participants.some((p) => p.user_id === LoggedUser.id)); // Or if logged in user is a participant
  
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(image);

  // Fallback image if the provided one fails to load
  const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(
    place
  )}/200/200`;

  // Always update the image when the prop changes
  useEffect(() => {
    if (image) {
      setImgSrc(image);
      setImgError(false);
    }
  }, [image]);

  // Pre-check if the image is from Google Maps or is a problematic URL
  useEffect(() => {
    if (
      typeof image === "string" &&
      (image.includes("google.com/maps") ||
        image.includes("maps.googleapis.com") ||
        image.includes("streetviewpixels"))
    ) {
      // Using fallback for Google Maps URLs
      setImgError(true);
    }
  }, [image]);
  const delayCard = 0.08;

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        delay: typeof id === "number" ? delayCard * id : 0,
        duration: 0.22,
        ease: "easeOut",
      }}
      className="flex flex-col"
    >
      <div className="flex flex-row items-center">
        <motion.div
          className="shadow-primary/20 rounded-lg p-3 pl-3 mb-4 cursor-grab bg-white shadow-md w-full"
          onClick={onClick}
          animate={refreshing ? { opacity: 0.7 } : { opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            {refreshing ? (
              <>
                <motion.div
                  className="w-20 h-20 rounded-lg mr-4 ml-4 bg-gray-200"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="flex-1">
                  <motion.div
                    className="h-4 w-32 bg-gray-200 mb-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="h-3 w-24 bg-gray-200"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </>
            ) : (
              <>
                <motion.img
                  src={imgError ? fallbackImage : imgSrc}
                  referrerPolicy="no-referrer"
                  alt={place}
                  className="w-20 h-20 object-cover rounded-lg mr-4 ml-4"
                  onError={() => setImgError(true)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
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
              </>
            )}
          </div>
        </motion.div>
        {isParticipant && (
          <div className="flex flex-col items-center justify-between pl-3 mr-7 gap-y-2 -mt-3">
            {!road && (
              <motion.div
                className="btn btn-sm btn-white rounded-full btn-circle shadow-sm"
                onClick={(e) => {
                  !refreshing && onRefresh(id);
                  e.stopPropagation();
                }}
                animate={refreshing ? { rotate: 360 } : {}}
                transition={
                  refreshing
                    ? { duration: 1, repeat: Infinity, ease: "linear" }
                    : {}
                }
                whileHover={!refreshing ? { scale: 1.1 } : {}}
                whileTap={!refreshing ? { scale: 0.9 } : {}}
              >
                <TfiReload className="text-primary text-lg" />
              </motion.div>
            )}
            <motion.div
              className="btn btn-sm btn-white rounded-full btn-circle shadow-sm"
              onClick={(e) => {
                onDelete && onDelete(id);
                e.stopPropagation();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <HiOutlineTrash className="text-primary text-xl" />
            </motion.div>
          </div>
        )}
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
