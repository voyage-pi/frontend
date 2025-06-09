import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { axiosUser, axiosInstance } from "../utils/axiosInstance";
import { supabase } from "../utils/supabaseClient";

const PreferencesSidebar = ({
  isOpen,
  onClose,
  tripId,
  onPreferencesUpdated,
  participants,
  showNotification,
}) => {
  const [userPreferences, setUserPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [currentPreferenceId, setCurrentPreferenceId] = useState(null);
  const [regenerationProgress, setRegenerationProgress] = useState(0);
  const [regenerationStatus, setRegenerationStatus] = useState("");
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const hasSelectedPreferences = useCallback(() => {
    return userPreferences.some((pref) => Number(pref.answer) > 0);
  }, [userPreferences]);

  useEffect(() => {
    if (isOpen) {
      loadCurrentTripPreferences();
    }
  }, [isOpen, tripId, participants]);

  const loadCurrentTripPreferences = async () => {
    setQuestionsLoading(true);
    setPreferencesLoaded(false);
    try {
      // First, fetch all questions from the API
      const questionsResponse = await axiosUser.get("/questions/");
      const questions = questionsResponse.data;

      // Find the preference_id from the current trip's participants
      let preferenceId = null;
      if (participants && participants.length > 0) {
        const participantWithPreferences = participants.find(
          (p) => p.preference_id
        );
        if (participantWithPreferences) {
          preferenceId = participantWithPreferences.preference_id;
          setCurrentPreferenceId(preferenceId);
        }
      }

      let preferences = [];

      if (preferenceId) {
        try {
          // Fetch the specific preference profile for this trip
          const preferenceResponse = await axiosUser.get(
            `/preferences/${preferenceId}`
          );
          const preferenceData = preferenceResponse.data.response.Preferences;

          // Map questions with the preference answers
          preferences = questions.map((q, index) => {
            // Find the answer for this question from the preference data
            const savedAnswer = preferenceData.answers.find(
              (a) => a.question_id === index
            );
            return {
              ...q,
              answer: savedAnswer ? Number(savedAnswer.value) : 0,
            };
          });

           ;
          setPreferencesLoaded(true);
        } catch (error) {
           ;
          // Fallback to localStorage if preference fetch fails
          const savedRatings =
            JSON.parse(localStorage.getItem("userRatings")) || [];
          preferences = questions.map((q, index) => ({
            ...q,
            answer: Number(savedRatings[index] || 0),
          }));
          setPreferencesLoaded(false);
        }
      } else {
        // No preference_id found, fallback to localStorage
        const savedRatings =
          JSON.parse(localStorage.getItem("userRatings")) || [];
        preferences = questions.map((q, index) => ({
          ...q,
          answer: Number(savedRatings[index] || 0),
        }));
        setPreferencesLoaded(false);
      }

      setUserPreferences(preferences);
    } catch (error) {
       ;
      // Fallback to empty array if API fails
      setUserPreferences([]);
      setPreferencesLoaded(false);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleWebSocketRegeneration = (tripId, preferencesData) => {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/v1/trip-management/ws/trip-regeneration/${tripId}`;

       ;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
         ;
        ws.send(JSON.stringify(preferencesData));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
         ;

        if (data.type === "progress") {
          setRegenerationProgress(data.progress);
          setRegenerationStatus(data.message);
          if (showNotification) {
            showNotification("info", `${data.message} (${data.progress}%)`);
          }
        } else if (data.type === "success") {
          setRegenerationProgress(100);
          setRegenerationStatus("Trip regenerated successfully!");
          resolve(data.data);
          ws.close();
        } else if (data.type === "error") {
           ;
          reject(new Error(data.message));
          ws.close();
        }
      };

      ws.onerror = (error) => {
         ;
        reject(new Error("WebSocket connection failed"));
      };

      ws.onclose = () => {
         ;
      };

      // Cleanup function
      const cleanup = () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };

      // Set a timeout
      setTimeout(() => {
        if (ws.readyState !== WebSocket.CLOSED) {
          cleanup();
          reject(new Error("WebSocket operation timed out"));
        }
      }, 180000); // 3 minutes timeout

      // Return cleanup function
      return cleanup;
    });
  };

  const handleRatingChange = useCallback((questionIndex, rating) => {
    setUserPreferences((prevPreferences) => {
      const updatedPreferences = JSON.parse(JSON.stringify(prevPreferences));
      const currentAnswer = Number(updatedPreferences[questionIndex].answer);

      if (currentAnswer === rating) {
        updatedPreferences[questionIndex].answer = 0;
      } else {
        updatedPreferences[questionIndex].answer = Number(rating);
      }

      const ratings = updatedPreferences.map((q) => Number(q.answer));
      // Keep localStorage as backup
      localStorage.setItem("userRatings", JSON.stringify(ratings));

      return updatedPreferences;
    });
  }, []);

  const handleSavePreferences = async () => {
    const ratings = userPreferences.map((q) => Number(q.answer));
    localStorage.setItem("userRatings", JSON.stringify(ratings));

    if (tripId && onPreferencesUpdated) {
      setIsLoading(true);
      setRegenerationProgress(0);
      setRegenerationStatus("Updating preferences...");

      // Notify parent about preferences update immediately
      if (onPreferencesUpdated) {
        onPreferencesUpdated({ type: "preferences-update-start" });
      }

      // Broadcast the start of preferences update to other users
      try {
        await supabase.channel(`trip-${tripId}`).send({
          type: "broadcast",
          event: "trip-update",
          payload: {
            tripId: tripId,
            timestamp: new Date().toISOString(),
            action: "preferences-update-start",
          },
        });
      } catch (error) {
         ;
      }

      try {
         ;
         ;
         ;

        // Check if we have a valid preference_id
        if (!currentPreferenceId) {
          throw new Error("No preference profile found for this trip");
        }

        // Prepare the payload for updating trip preferences
        const answers = userPreferences.map((question, index) => ({
          question_id: index,
          value: Number(question.answer),
        }));

        const payload = {
          preference_id: currentPreferenceId,
          answers: answers,
          participants: participants,
        };

         ;

        // Update preferences first (synchronous operation)
         ;
        const response = await axiosUser.put(
          `/preferences/trip/${tripId}`,
          payload
        );

        if (
          response.data &&
          response.data.response &&
          response.data.response.websocket_regeneration
        ) {
          console.log(
            "Preferences updated, starting WebSocket regeneration..."
          );

          if (showNotification) {
            showNotification(
              "info",
              "Preferences updated! Starting trip regeneration..."
            );
          }

          // Use WebSocket for trip regeneration
          try {
            const regenerationResult = await handleWebSocketRegeneration(
              tripId,
              payload
            );
             ;

            // Process the result similar to the old HTTP response
            if (regenerationResult && regenerationResult.itinerary) {
              // Ensure participants are preserved in the response
              const responseWithParticipants = {
                response: {
                  ...regenerationResult,
                  participants: participants,
                },
              };
              onPreferencesUpdated(responseWithParticipants);
              if (showNotification) {
                showNotification(
                  "success",
                  "Trip preferences updated and trip regenerated successfully!"
                );
              }
              onClose();
            }
          } catch (wsError) {
             ;
            if (showNotification) {
              showNotification(
                "error",
                `Trip regeneration failed: ${wsError.message}`
              );
            }
          }
        } else {
           ;
          if (showNotification) {
            showNotification("error", "Unexpected response from server");
          }
        }
      } catch (error) {
         ;
         ;

        // Show more specific error message
        let errorMessage =
          "Failed to update trip preferences. Please try again.";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        if (showNotification) {
          showNotification("error", errorMessage);
        } else {
          alert(errorMessage);
        }
      } finally {
        setIsLoading(false);
        setRegenerationProgress(0);
        setRegenerationStatus("");
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
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 flex flex-col"
        >
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-secondary">
                Preferences Profile
                {currentPreferenceId && (
                  <span className="text-sm font-normal text-gray-500 block">
                    Current Trip Profile (ID: {currentPreferenceId})
                  </span>
                )}
              </h2>
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
                    <div
                      key={question.id}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <h3 className="font-medium mb-1">{question.question}</h3>
                      {question.description && (
                        <p className="text-sm text-gray-500 mb-3">
                          {question.description}
                        </p>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((rating) => {
                          const isSelected = answerValue === rating;

                          return (
                            <button
                              key={rating}
                              onClick={() => handleRatingChange(index, rating)}
                              title={
                                rating === 1
                                  ? "Not at all"
                                  : rating === 4
                                  ? "Neutral"
                                  : rating === 7
                                  ? "Very much"
                                  : ""
                              }
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                              ${
                                isSelected
                                  ? "bg-primary text-white border-primary ring-2 ring-primary/30"
                                  : "bg-white border border-gray-300 hover:bg-primary/10"
                              }
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
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-white">
            {preferencesLoaded && hasSelectedPreferences() && (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-100 transition-colors"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={
                      isLoading || questionsLoading || !currentPreferenceId
                    }
                    className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ${
                      isLoading || questionsLoading || !currentPreferenceId
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                    type="button"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {regenerationProgress > 0
                          ? `${regenerationProgress}%`
                          : "Updating..."}
                      </div>
                    ) : (
                      "Save & Update Trip"
                    )}
                  </button>
                </div>

                {/* Progress indicator */}
                {isLoading && regenerationProgress > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      {regenerationStatus}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${regenerationProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {regenerationProgress}% complete
                    </div>
                  </div>
                )}
              </>
            )}
            {preferencesLoaded && !hasSelectedPreferences() && (
              <div className="text-center text-gray-500">
                Select at least one preference to update the trip
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreferencesSidebar;
