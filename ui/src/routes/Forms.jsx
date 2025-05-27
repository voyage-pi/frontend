import { useState, useEffect } from "react";
import PageTemplate from "../components/PageTemplate";
import StepIndicator from "../components/StepIndicator";
import StepContent from "../components/forms/StepContent";
import VoyageLogo from "../assets/voyage-complete-logo-navy.png";
import { useNavigate } from "react-router-dom";
import { axiosUser } from "../utils/axiosInstance";
import LoadingItinerary from "../components/LoadingItinerary";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { TiArrowLeft, TiArrowRight } from "react-icons/ti";
import Notification from "../components/Notification";
import { useAuth } from "../context/AuthContext";
import TripCreationWebSocket from "../utils/websocketClient";

function Forms() {
  const [isInitialized, setIsInitialized] = useState(false);
  // Get saved values from localStorage for initial state
  const savedStep = localStorage.getItem("currentStep");
  const savedSubQuestionIndex = localStorage.getItem("subQuestionIndex");
  const savedStep6SubStep = localStorage.getItem("step6SubStep");
  const savedIsGroup = localStorage.getItem("isGroup");

  // Initialize state with localStorage values if available
  const [currentStep, setCurrentStep] = useState(
    savedStep ? Number(savedStep) : 1
  );
  const [subQuestionIndex, setSubQuestionIndex] = useState(
    savedSubQuestionIndex ? Number(savedSubQuestionIndex) : 0
  );
  const [step6SubStep, setStep6SubStep] = useState(
    savedStep6SubStep ? Number(savedStep6SubStep) : 0
  );
  const [isGroup, setIsGroup] = useState(savedIsGroup === "true");

  const totalSteps = 6;
  const [disableButton, setDisableButton] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [totalSubQuestions, setTotalSubQuestions] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isStep5Valid, setIsStep5Valid] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showLeaveButton, setShowLeaveButton] = useState(true);
  const [addedUsers, setAddedUsers] = useState([]);

  const [showProgress, setShowProgress] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [wsClient, setWsClient] = useState(null);

  const getQuestions = async () => {
    const response = await axiosUser.get("/questions/");
    return response.data;
  };
  // Carregar o progresso do localStorage quando o componente for montado
  useEffect(() => {
    const initialize = async () => {
      console.log("Initializing - Current step is:", currentStep);
      // Load saved answers if available
      const savedAnswers = localStorage.getItem("answers");
      // Load addedUsers from localStorage if they exist
      const savedAddedUsers = localStorage.getItem("addedUsers");
      if (savedAddedUsers) {
        try {
          const parsedUsers = JSON.parse(savedAddedUsers);
          setAddedUsers(parsedUsers);
          // If there are added users, set isGroup to true
          if (parsedUsers.length > 0) {
            setIsGroup(true);
          }
        } catch (error) {
          console.error("Error parsing saved addedUsers:", error);
          setAddedUsers([]);
        }
      }
      try {
        const qs = await getQuestions();
        setTotalSubQuestions(qs.length);
          const QA = qs.map((q) => ({ ...q}));
          setAnswers(QA);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };
    initialize();
    setIsInitialized(true);
  }, []);

  // Salvar o progresso no localStorage sempre que mudar
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("currentStep", currentStep);
      localStorage.setItem("subQuestionIndex", subQuestionIndex);
      localStorage.setItem("step6SubStep", step6SubStep);
      localStorage.setItem("answers", JSON.stringify(answers));
      localStorage.setItem("isGroup", isGroup);
      localStorage.setItem("addedUsers", JSON.stringify(addedUsers));
    }
  }, [
    currentStep,
    subQuestionIndex,
    step6SubStep,
    answers,
    isGroup,
    addedUsers,
    isInitialized,
  ]);

  // Calculate progress percentage for progress bar

  const progressPercentage =
    currentStep === 5
      ? Math.round((subQuestionIndex / totalSubQuestions) * 100)
      : 0;

  const handleNext = () => {
    setDisableButton(true);
    const profile = localStorage.getItem("Preferences Profile");
    if (profile === "Old" && currentStep === 5) {
      console.log("Old profile detected, skipping step 5");
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (currentStep === 5) {
      // Check if current question has an answer

      const currentQuestionHasAnswer =
        answers[subQuestionIndex]?.answer !== undefined;

      // If trying to proceed without an answer, show error
      if (!currentQuestionHasAnswer) {
        setShowError(true);
        return;
      }
    }

    if (currentStep < 5) {
      if (localStorage.getItem("Trip Type") == "road") {
        setCurrentStep(currentStep + 2);
        return;
      }
      setCurrentStep(currentStep + 1);
      return;
    }

    if (currentStep === 5) {
      if (subQuestionIndex < totalSubQuestions - 1) {
        setSubQuestionIndex(subQuestionIndex + 1);
      } else {
        // When all questions in step 5 are done, go to step 6
        setCurrentStep(currentStep + 1);
        setStep6SubStep(0); // Ensure we start at the first substep of step 6
      }
      return;
    }

    if (currentStep === 6) {
      if (step6SubStep === 0) {
        setStep6SubStep(1);
      } else {
        handleFinish();
      }
    }
  };

  const handleBack = () => {
    setDisableButton(true);
    const profile = localStorage.getItem("Preferences Profile");
    if (currentStep === 6 && profile === "Old") {
      setCurrentStep(5);
      setSubQuestionIndex(0);
      return;
    }
    if (currentStep === 1) return;

    if (currentStep < 5) {
      setCurrentStep(currentStep - 1);
      return;
    }

    if (currentStep === 5) {
      if (subQuestionIndex > 0) {
        setSubQuestionIndex(subQuestionIndex - 1);
      } else {
        if (localStorage.getItem("Trip Type") == "road") {
          setCurrentStep(currentStep - 2);
          return;
        }
        setCurrentStep(currentStep - 1);
      }
      return;
    }

    if (currentStep === 6) {
      if (step6SubStep === 1) {
        setStep6SubStep(0);
      } else {
        setCurrentStep(currentStep - 1);
        setSubQuestionIndex(0); // Go back to the last question of step 5
      }
    }
  };

  const handleRatingSelect = (rating) => {
    // Update the answers state
    setAnswers((prevAnswers) => {
      const updated = [...prevAnswers];
      updated[subQuestionIndex].answer = rating;
      return updated;
    });

    // Also save to localStorage for persistence and to be used in Itinerary
    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    savedRatings[subQuestionIndex] = rating;
    localStorage.setItem("userRatings", JSON.stringify(savedRatings));
    console.log("Updated userRatings in localStorage:", savedRatings);
  };

  const handleLeave = () => {
    navigate("/");
  };

  const handleFinish = async () => {
    const userRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    const mustVisitPlaces =
      JSON.parse(localStorage.getItem("MustVisitPlaces")) || [];
    const keywords = JSON.parse(localStorage.getItem("Keywords")) || [];

    const storedStartDate = localStorage.getItem("Start Date");
    const startDate = storedStartDate ? new Date(storedStartDate) : new Date();
    const formattedDate = startDate.toISOString();

    const duration = Math.max(
      1,
      parseInt(localStorage.getItem("Duration")) || 1
    );

    const tripType = localStorage.getItem("Trip Type");
    let obj = {};

    if (tripType === "zone") {
      obj.radius = localStorage.getItem("radius");
      obj.center = {
        latitude: parseFloat(localStorage.getItem("Latitude")) || 0,
        longitude: parseFloat(localStorage.getItem("Longitude")) || 0,
      };
      obj.type = "zone";
    } else if (tripType == "place") {
      obj.coordinates = {
        latitude: parseFloat(localStorage.getItem("Latitude")) || 0,
        longitude: parseFloat(localStorage.getItem("Longitude")) || 0,
      };
      obj.place_name = localStorage.getItem("Location");
      obj.type = "place";
    } else if (tripType == "road") {
      obj.origin = JSON.parse(localStorage.getItem("origin"));
      obj.destination = JSON.parse(localStorage.getItem("destination"));
      obj.polylines = localStorage.getItem("route");
      obj.type = "road";
    }

    const formattedMustVisitPlaces = mustVisitPlaces.map((obj) => obj.place);
    const location = localStorage.getItem("Location") || "";
    let locationParts;
    let country;
    let city;

    if (localStorage.getItem("Trip Type") === "road") {
      const destinationText = localStorage.getItem("currentTextDes") || "";
      locationParts = destinationText.split(",").map((part) => part.trim());
      country = locationParts[locationParts.length - 1] || null;
      city = locationParts[locationParts.length - 2] || null;
    } else {
      locationParts = location.split(",").map((part) => part.trim());
      country = locationParts[locationParts.length - 1] || null;
      city = locationParts[locationParts.length - 2] || null;
    }
    console.log("answers:", answers);

    const formData = {
      budget: parseFloat(localStorage.getItem("Budget")) || 0,
      startDate: formattedDate,
      duration: duration,
      tripType: tripType,
      display_name: localStorage.getItem("Location"),
      country: country,
      city: city,
      data_type: obj,
      must_visit_places: formattedMustVisitPlaces,
      keywords: keywords,
      preferences: {
        questions: userRatings.map((answer, index) => ({
          question_id: index,
          value: parseInt(answer) || 0,
          type: "scale",
        })),
      },
      is_group: isGroup,
    };
    // If the user is authenticated, include preferences name in the formData

    if (isAuthenticated) {
      formData.preferences["preferencesName"] =
        localStorage.getItem("preferencesName");
    } else {
      // for trip-management to make the distinction between guest and authenticated users for preferences and trip saving
      formData["guest"] = true;
    }
    console.log("Creating trip via WebSocket:", formData);

    try {
      setShowProgress(true);
      setProgressPercent(0);
      setProgressMessage("Connecting to trip creation service...");

      const client = new TripCreationWebSocket();
      setWsClient(client);

      client.setEventHandlers({
        onConnection: (message, progress) => {
          setProgressMessage(message);
          setProgressPercent(progress);
        },
        onProgress: (message, progress, tripId) => {
          setProgressMessage(message);
          setProgressPercent(progress);
        },
        onSuccess: async (message, responseData, tripId) => {
          console.log("Trip created successfully with ID:", tripId);
          setProgressMessage("Trip created successfully!");
          setProgressPercent(100);

          setTimeout(async () => {
            setShowProgress(false);

            navigate(`/itinerary/${tripId}`, {
              state: {
                itineraryData: { response: responseData },
                userRatings: userRatings,
              },
            });

            const keysToRemove = [
              "currentStep",
              "subQuestionIndex",
              "step6SubStep",
              "answers",
              "Start Date",
              "Trip Type",
              "radius",
              "Latitude",
              "Longitude",
              "Location",
              "Budget",
              "Duration",
              "userRatings",
              "MustVisitPlaces",
              "Keywords",
              "currentTextDes",
              "currentTextOrigin",
              "origin",
              "destination",
              "route",
              "isGroup",
              "addedUsers",
            ];

            keysToRemove.forEach((key) => localStorage.removeItem(key));

            answers.forEach((answer) => {
              answer.answer = null;
            });
            setAnswers([...answers]);
            setCurrentStep(1);
            setSubQuestionIndex(0);
            setStep6SubStep(0);
            setIsGroup(false);
            setAddedUsers([]);

            for (const user of addedUsers) {
              try {
                await axiosUser.post(`/trips/invite/${user.id}/${tripId}`);
              } catch (e) {
                console.error(`Failed to invite user ${user.id}:`, e);
              }
            }
          }, 1500);
        },
        onError: (message, progress) => {
          console.error("WebSocket error:", message);
          setProgressMessage(`Error: ${message}`);
          setTimeout(() => {
            setShowProgress(false);
            setIsNavigating(false);
          }, 3000);
        },
      });

      await client.connect();
      client.sendTripData(formData);
    } catch (error) {
      console.error("Error creating trip via WebSocket:", error);
      setShowProgress(false);
      setIsNavigating(false);
    }
  };

  if (!isInitialized || isNavigating || showProgress) {
    return (
      <LoadingItinerary
        message={progressMessage}
        progress={progressPercent}
        showProgress={showProgress}
      />
    );
  }
  const renderNextOrFinishButton = () => {
    const isDisabled = disableButton 

    const baseNextButton = (
      <button
        onClick={handleNext}
        className={`ml-auto px-4 text-primary hover:text-rose-700 font-medium flex items-center ${
          isDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isDisabled}
      >
        Next <TiArrowRight className="ml-1" />
      </button>
    );

      if (
      (currentStep >= 1 && currentStep < 5) ||
      (currentStep === 5 && subQuestionIndex < totalSubQuestions - 1)
    ) {
      return baseNextButton;
    }

    if (currentStep === 5 || (currentStep === 6 && step6SubStep === 0)) {
      return (
        <button
          onClick={handleNext}
          className="ml-auto px-4 text-primary hover:text-rose-700 font-medium flex items-center"
        >
          Next <TiArrowRight className="ml-1" />
        </button>
      );
    }

    if (currentStep === 6 && step6SubStep === 1) {
      return (
        <button onClick={handleNext} className="ml-auto btn btn-primary">
          Finish
        </button>
      );
    }

    return null;
  };

  return (
    <PageTemplate>
      <div className="flex justify-center w-full">
        <div className="flex justify-center items-center flex-col w-full px-4">
          <div className="mb-4">
            <img
              src={VoyageLogo}
              alt="Voyage Logo"
              className="h-30 cursor-pointer"
              onClick={handleLeave}
            />
          </div>

          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          <div className="relative bg-white rounded-md shadow-primary shadow-[0px_0px_20px_-13px] p-6 w-7xl mx-auto my-4 mt-15 overflow-hidden">
            <StepContent
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              subQuestionIndex={subQuestionIndex}
              totalSubQuestions={totalSubQuestions}
              setSubQuestionIndex={setSubQuestionIndex}
              answers={answers}
              setDisableButton={setDisableButton}
              onRatingSelect={handleRatingSelect}
              onValidationChange={setIsStep5Valid}
              setShowLeaveButton={setShowLeaveButton}
              handleNext={handleNext}
              step6SubStep={step6SubStep}
              setIsGroup={setIsGroup}
              addedUsers={addedUsers}
              setAddedUsers={setAddedUsers}
            />

            {showError && (
              <Notification
                type="error"
                text="You must select an answer before proceeding"
                onClose={() => setShowError(false)}
              />
            )}

            <div className="flex justify-between mt-8">
              {/* Leave Button */}
              {currentStep === 1 && showLeaveButton && (
                <button onClick={handleLeave} className="btn btn-primary">
                  <BsArrowLeftSquareFill className="text-white" /> Leave
                </button>
              )}

              {/* Back Button */}
              {currentStep>1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-primary hover:text-rose-700 flex items-center"
                >
                  <TiArrowLeft className="mr-1" /> Back
                </button>
              )}

              {renderNextOrFinishButton()}
            </div>

            {currentStep === 5 && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default Forms;
