import React, { useState, useEffect } from "react";
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
    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    
    if (savedRatings.length > 0) {
      // If we have saved ratings, use them
      const preferences = questions.map((q, index) => ({
        ...q,
        answer: savedRatings[index] || 0
      }));
      
      setUserPreferences(preferences);
      
      // Calculate average rating
      const validRatings = savedRatings.filter(rating => rating > 0);
      if (validRatings.length > 0) {
        const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
        setAverageRating((sum / validRatings.length).toFixed(1));
      }
    } else {
      // Otherwise, use the default questions
      setUserPreferences([...questions]);
    }
  }, [isOpen]);

  const handleRatingChange = (questionIndex, rating) => {
    setUserPreferences(prevPreferences => {
      const updatedPreferences = [...prevPreferences];
      updatedPreferences[questionIndex].answer = rating;
      
      // Recalculate average rating
      const validRatings = updatedPreferences
        .map(pref => pref.answer)
        .filter(rating => rating > 0);
      
      if (validRatings.length > 0) {
        const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
        setAverageRating((sum / validRatings.length).toFixed(1));
      } else {
        setAverageRating(0);
      }
      
      return updatedPreferences;
    });
  };

  const handleSavePreferences = async () => {
    // Save to localStorage
    const ratings = userPreferences.map(q => q.answer);
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
              value: parseInt(pref.answer) || 0,
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
              <h2 className="text-xl font-bold text-primary">Preferences Profile</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>
            
            {/* Summary Section */}
            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-primary mb-2">Preference Summary</h3>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-primary">{averageRating}</span>
                    <span className="text-sm text-gray-500 ml-1">/ 7</span>
                  </div>
                </div>
                <div className="ml-4 w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{averageRating}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your preference profile helps us tailor your trip to match your interests.
              </p>
            </div>

            <div className="space-y-6">
              {userPreferences.map((question, index) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">{question.question}</h3>
                  {question.description && (
                    <p className="text-sm text-gray-500 mb-3">{question.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingChange(index, rating)}
                        title={rating === 1 ? "Not at all" : 
                               rating === 4 ? "Neutral" : 
                               rating === 7 ? "Very much" : ""}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                          ${question.answer === rating
                            ? "bg-primary text-white"
                            : "bg-white border border-gray-300 hover:bg-primary/10"
                          }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                    <span>Not at all</span>
                    <span>Very much</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                disabled={isLoading}
                className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
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