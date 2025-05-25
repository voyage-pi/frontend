import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaPhone, FaClock, FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaXmark, FaLocationDot, FaMap } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import Map from "./Map";
import { axiosPlace, axiosUser } from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";

// Generate placeholder image as a fallback
const generatePlaceholderImage = (seed) => {
  const seedStr = typeof seed === "string" ? seed : "place";
  const cleanSeed = seedStr.replace(/[^a-zA-Z0-9]/g, "");
  return `https://picsum.photos/seed/${encodeURIComponent(cleanSeed)}/400/300`;
};

// Get photo URL using the same logic as TripCard.jsx
const getPhotoUrl = async (photo) => {
  if (!photo || !photo.name) {
    console.log("No photo available");
    return generatePlaceholderImage("place");
  }

  try {
    const response = await axiosPlace.post("/places/photo", {
      gRPC: photo.name,
    });

    if (response.status === 429) {
      return getPhotoUrl(photo); // Retry if rate limited
    }

    return response.data?.uri;
  } catch (error) {
    console.error("Error fetching photo:", error);
    return generatePlaceholderImage("place");
  }
};

function PlaceDetailSidebar({ place, isOpen, onClose, onToggleSave, savingState }) {
  const { isAuthenticated } = useAuth();
  const [currentImage, setCurrentImage] = useState(place?.image || generatePlaceholderImage(place?.name));
  const [imageError, setImageError] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [isSaved, setIsSaved] = useState(place?.isSaved || false);

  // Check if place is saved when it changes
  useEffect(() => {
    setIsSaved(place?.isSaved || false);
  }, [place]);

  // Fetch and process photos when place changes
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!place?.photos || place.photos.length === 0) {
        setPhotoUrls([generatePlaceholderImage(place?.name)]);
        setLoadingPhotos(false);
        return;
      }

      setLoadingPhotos(true);
      try {
        // Get first 5 photos
        const photosToFetch = place.photos.slice(0, 5);
        const urls = await Promise.all(
          photosToFetch.map(photo => getPhotoUrl(photo))
        );
        setPhotoUrls(urls);
        setCurrentImage(urls[0]); // Set first photo as current
      } catch (error) {
        console.error("Error fetching photos:", error);
        setPhotoUrls([generatePlaceholderImage(place?.name)]);
      } finally {
        setLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, [place]);

  const handleImageError = () => {
    setImageError(true);
    setCurrentImage(generatePlaceholderImage(place?.name));
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photoUrls.length);
    setCurrentImage(photoUrls[(currentPhotoIndex + 1) % photoUrls.length]);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
    setCurrentImage(photoUrls[(currentPhotoIndex - 1 + photoUrls.length) % photoUrls.length]);
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated || !place || !place.id) {
      // Handle non-authenticated state or invalid place
      console.log("Cannot save: User not authenticated or invalid place");
      return;
    }

    try {
      // Call the provided toggle save function
      await onToggleSave(place.id);
      // The parent component will update the isSaved state via the place prop
    } catch (error) {
      console.error("Error toggling save state:", error);
    }
  };

  const marker = place ? {
    position: {
      lat: place.latitude || 48.8566,
      lng: place.longitude || 9.3517
    },
    title: place.name,
    address: place.address,
    image: currentImage
  } : null;

  const formatHours = (hours) => {
    if (!hours || !Array.isArray(hours) || hours.length === 0) {
      return [{ day: "Information not available", hours: "" }];
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return hours.map(period => {
      const openDay = days[period.open.day];
      const openTime = `${period.open.hour.toString().padStart(2, '0')}:${period.open.minute.toString().padStart(2, '0')}`;
      const closeTime = period.close ? 
        `${period.close.hour.toString().padStart(2, '0')}:${period.close.minute.toString().padStart(2, '0')}` : 
        'Closed';
      return {
        day: openDay,
        hours: `${openTime} - ${closeTime}`
      };
    });
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
              {/* Photo Carousel Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 overflow-hidden relative">
                {loadingPhotos ? (
                  <div className="w-full h-52 bg-gray-100 animate-pulse"></div>
                ) : (
                  <>
                    <img
                      src={currentImage}
                      alt={place.name}
                      className="w-full h-52 object-cover"
                      onError={handleImageError}
                      referrerPolicy="no-referrer"
                    />
                    {photoUrls.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
                        >
                          <FaChevronLeft className="text-gray-700" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
                        >
                          <FaChevronRight className="text-gray-700" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {photoUrls.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentPhotoIndex
                                  ? "bg-white scale-125"
                                  : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
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
              {place.openHours && place.openHours.length > 0 && (
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
                          <span className="font-medium">{review.author_name}</span>
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
              {isAuthenticated && (
                <button
                  className={`btn btn-primary w-full flex items-center justify-center gap-2 py-3 pt-3 ${savingState ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleToggleSave}
                  disabled={savingState}
                >
                  {savingState ? (
                    "Processing..."
                  ) : isSaved ? (
                    <>
                      <FaHeart /> Remove from Saved
                    </>
                  ) : (
                    <>
                      <FaRegHeart /> Add to Saved
                    </>
                  )}
                </button>
              )}
              
              {!isAuthenticated && (
                <div className="text-center text-gray-500 mb-4">
                  Login to save this place to your favorites
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PlaceDetailSidebar; 