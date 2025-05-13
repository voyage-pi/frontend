import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaXmark, FaLocationDot } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

function PlaceDetailSidebar({ place, isOpen, onClose, onToggleSave }) {
  return (
    <AnimatePresence>
      {isOpen && place && (
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 20 }}
          className="absolute top-0 right-0 h-full w-full bg-white shadow-lg z-50 overflow-y-auto"
        >
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
              <div className="flex items-center mb-3 mt-3">
                <FaLocationDot className="text-primary text-xl mr-3" />
                <h2 className="font-bold text-lg">Place Details</h2>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                onClick={onClose}
              >
                <FaXmark />
              </button>
            </div>

            {/* Place details */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                <img 
                  src={place.image} 
                  alt={place.name} 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />

                <div className="mb-4">
                  <h2 className="text-2xl font-bold">{place.name}</h2>
                  <div className="flex items-center text-gray-600 mt-1">
                    <FaLocationDot className="mr-1" />
                    <span>{place.location}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">About</h3>
                  <p className="text-gray-700">
                    {place.description || "No description available for this place."}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="mt-6">
                  <button 
                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
                    onClick={() => onToggleSave && onToggleSave(place.id)}
                  >
                    {place.isSaved ? (
                      <>
                        <FaHeart /> Remove from Saved
                      </>
                    ) : (
                      <>
                        <FaRegHeart /> Add to Saved
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PlaceDetailSidebar; 