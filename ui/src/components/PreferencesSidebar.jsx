import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import questions from "../../public/questions.json";
import { axiosRecommendation } from "../utils/axiosInstance";

const PreferencesSidebar = ({ isOpen, onClose, tripId, onPreferencesUpdated }) => {
  const [userPreferences, setUserPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Load saved preferences from localStorage or use defaults from questions.json
  useEffect(() => {
    if (isOpen) {
      const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
      
      if (savedRatings && savedRatings.length > 0 && savedRatings.some(rating => Number(rating) > 0)) {
        // If we have saved ratings with at least one non-zero rating, use them
        const preferences = questions.map((q, index) => ({
          ...q,
          answer: Number(savedRatings[index] || 0)
        }));
        
        setUserPreferences(preferences);
        
        // Calculate average rating
        const validRatings = savedRatings.filter(rating => Number(rating) > 0).map(Number);
        if (validRatings.length > 0) {
          const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
          setAverageRating((sum / validRatings.length).toFixed(1));
        }
      } else {
        // Otherwise, use the default questions with answers set to 0
        setUserPreferences(
          questions.map(q => ({ ...q, answer: 0 }))
        );
        setAverageRating(0);
      }
    }
  }, [isOpen]);
  
  // Use a memoized handler to prevent re-creation on every render
  const handleRatingChange = useCallback((questionIndex, rating) => {
    setUserPreferences(prevPreferences => {
      // Deep clone the array to ensure we're not mutating the previous state
      const updatedPreferences = JSON.parse(JSON.stringify(prevPreferences));
      
      // Make sure we're comparing numbers, not strings
      const currentAnswer = Number(updatedPreferences[questionIndex].answer);
      
      // Toggle rating off if clicking the same rating again
      if (currentAnswer === rating) {
        updatedPreferences[questionIndex].answer = 0;
      } else {
        updatedPreferences[questionIndex].answer = Number(rating);
      }
      
      // Recalculate average rating
      const validRatings = updatedPreferences
        .map(pref => Number(pref.answer))
        .filter(r => r > 0);
      
      if (validRatings.length > 0) {
        const sum = validRatings.reduce((acc, r) => acc + r, 0);
        setAverageRating((sum / validRatings.length).toFixed(1));
      } else {
        setAverageRating(0);
      }
      
      // Immediately save to localStorage
      const ratings = updatedPreferences.map(q => Number(q.answer));
      localStorage.setItem("userRatings", JSON.stringify(ratings));
      
      return updatedPreferences;
    });
  }, []);

  const handleSavePreferences = async () => {
    // Save to localStorage
    const ratings = userPreferences.map(q => Number(q.answer));
    localStorage.setItem("userRatings", JSON.stringify(ratings));

    if (tripId && onPreferencesUpdated) {
      setIsLoading(true);
      try {
        // Format the preferences for the API
        const formattedPreferences = {
          tripId: tripId,
          questions: {
            user123: userPreferences.map((pref) => ({
              question_id: pref.id,
              value: Number(pref.answer) || 0,
              type: "scale",
            })),
          }
        };

        // Send to API to regenerate itinerary
        const response = await axiosRecommendation.post(
          `/trip/${tripId}/regenerate-trip`, 
          formattedPreferences
        );

        if (response.data && response.data.response) {
          // Call the callback to update the itinerary
          onPreferencesUpdated(response.data);
          onClose(); // Close the sidebar after successful update
        }
      } catch (error) {
        console.error("Error updating preferences:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClose(); // Just close the sidebar if we don't have a tripId
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-secondary">Preferences Profile</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {userPreferences.map((question, index) => {
                const answerValue = Number(question.answer);
                
                return (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">{question.question}</h3>
                  {question.description && (
                    <p className="text-sm text-gray-500 mb-3">{question.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((rating) => {
                      const isSelected = answerValue === rating;
                      
                      return (
                        <button
                          key={rating}
                          onClick={() => handleRatingChange(index, rating)}
                          title={rating === 1 ? "Not at all" : 
                                rating === 4 ? "Neutral" : 
                                rating === 7 ? "Very much" : ""}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                            ${isSelected 
                              ? "bg-primary text-white border-primary ring-2 ring-primary/30" 
                              : "bg-white border border-gray-300 hover:bg-primary/10"}
                          `}
                          type="button"
                        >
                          {rating}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                    <span>Not at all</span>
                    <span>Very much</span>
                  </div>
                </div>
              )})}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-100 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                disabled={isLoading}
                className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                type="button"
              >
                {isLoading ? "Updating..." : "Save & Update Trip"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreferencesSidebar; 