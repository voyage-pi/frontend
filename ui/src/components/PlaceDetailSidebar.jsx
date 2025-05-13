import React from "react";
import { FaHeart, FaRegHeart, FaPhone, FaClock, FaStar } from "react-icons/fa";
import { FaXmark, FaLocationDot, FaMap } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import Map from "./Map";

function PlaceDetailSidebar({ place, isOpen, onClose, onToggleSave }) {
  const marker = place ? {
    position: {
      lat: place.latitude || 48.8566,
      lng: place.longitude || 9.3517
    },
    title: place.name,
    address: place.address,
    image: place.image
  } : null;

  const formatHours = (hours) => {
    if (!hours || !Array.isArray(hours) || hours.length === 0) {
      return [{ day: "Information not available", hours: "" }];
    }

    return hours;
  };

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
            <div className="sticky top-0 py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
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
              {/* Photo Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-52 object-cover"
                />
              </div>

              {/* Main Info Section */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold">{place.name}</h2>
                </div>

                {/* Address */}
                <div className="flex items-start text-gray-700 mt-3 mb-4">
                  <FaMap className="mt-1 mr-2 text-primary flex-shrink-0" />
                  <span>{place.address || "Address not available"}</span>
                </div>

                <p className="text-gray-700">
                  {place.description || "No description available for this place."}
                </p>
              </div>

              {/* Map Section */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                <h3 className="font-semibold text-lg mb-3">Location</h3>
                <div className="h-52 rounded-lg overflow-hidden">
                  {marker && <Map markers={[marker]} />}
                </div>
              </div>

              

              {/* Operating Hours Section */}
              {place.openHours && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                  <div className="flex items-center mb-3">
                    <FaClock className="text-primary mr-2" />
                    <h3 className="font-semibold text-lg">Opening Hours</h3>
                  </div>
                  <div className="space-y-2">
                    {formatHours(place.openHours).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{item.day}</span>
                        <span className="text-gray-600">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              {place.reviews && place.reviews.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                  <h3 className="font-semibold text-lg mb-3">Reviews</h3>
                  <div className="space-y-4">
                    {place.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                                size={14}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.author}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Section */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8">
                <h3 className="font-semibold text-lg mb-4 pb-2">More Information</h3>

                {/* Rating */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Rating</span>
                  <div className="flex items-center">
                    {place.rating ? (
                      <div className="flex items-center">
                        <div className="flex items-center text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < Math.floor(place.rating) ? "text-yellow-400" : "text-gray-300"}
                              size={16}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{place.rating}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Not rated yet</span>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Phone Number</span>
                  {place.phone ? (
                    <a href={`tel:${place.phone}`} className="text-primary hover:underline transition-colors">
                      {place.phone}
                    </a>
                  ) : (
                    <span className="text-gray-500">Not available</span>
                  )}
                </div>

                {/* Opening Hours Summary */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Opening Hours</span>
                  <span className="text-gray-500">
                    {place.openHours && place.openHours.length > 0
                      ? "Available above"
                      : "Not available"}
                  </span>
                </div>

                {/* Reviews Summary */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-700 font-medium">Reviews</span>
                  <span className="text-gray-500">
                    {place.reviews && place.reviews.length > 0
                      ? `${place.reviews.length} ${place.reviews.length === 1 ? 'review' : 'reviews'}`
                      : "No reviews yet"}
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <button
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 pt-3"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PlaceDetailSidebar; 