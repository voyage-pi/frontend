import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { axiosUser } from "../utils/axiosInstance";

const PreferencesSidebar = ({ isOpen, onClose, tripId, onPreferencesUpdated }) => {
  const [userPreferences, setUserPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    setQuestionsLoading(true);
    try {
      // Fetch questions from the API
      const response = await axiosUser.get("/questions/");
      const questions = response.data;
      
      // Get saved ratings from localStorage
      const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
      
      // Map questions with saved ratings or default to 0
      const preferences = questions.map((q, index) => ({
        ...q,
        answer: Number(savedRatings[index] || 0)
      }));
      
      setUserPreferences(preferences);
    } catch (error) {
      console.error("Error fetching questions:", error);
      // Fallback to empty array if API fails
      setUserPreferences([]);
    } finally {
      setQuestionsLoading(false);
    }
  };
  
  const handleRatingChange = useCallback((questionIndex, rating) => {
    setUserPreferences(prevPreferences => {
      const updatedPreferences = JSON.parse(JSON.stringify(prevPreferences));
      const currentAnswer = Number(updatedPreferences[questionIndex].answer);
      
      if (currentAnswer === rating) {
        updatedPreferences[questionIndex].answer = 0;
      } else {
        updatedPreferences[questionIndex].answer = Number(rating);
      }
      
      const ratings = updatedPreferences.map(q => Number(q.answer));
      localStorage.setItem("userRatings", JSON.stringify(ratings));
      
      return updatedPreferences;
    });
  }, []);

  const handleSavePreferences = async () => {
    const ratings = userPreferences.map(q => Number(q.answer));
    localStorage.setItem("userRatings", JSON.stringify(ratings));

    if (tripId && onPreferencesUpdated) {
      setIsLoading(true);
      try {
        // format payload
        // make the api call
        
        if (response.data && response.data.response) {
          onPreferencesUpdated(response.data);
          onClose(); 
        }
      } catch (error) {
        console.error("Error updating preferences:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClose(); 
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
            
            {questionsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading questions...</span>
              </div>
            ) : (
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
            )}

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
                disabled={isLoading || questionsLoading}
                className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ${
                  isLoading || questionsLoading ? "opacity-70 cursor-not-allowed" : ""
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