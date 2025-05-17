import { useState, useEffect } from "react";
import PageTemplate from "../components/PageTemplate";
import StepIndicator from "../components/StepIndicator";
import StepContent from "../components/forms/StepContent";
import VoyageLogo from "../assets/voyage-complete-logo-navy.png";
import { useNavigate } from "react-router-dom";
import { axiosInstance, axiosUser } from "../utils/axiosInstance";
import LoadingItinerary from "../components/LoadingItinerary";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { TiArrowLeft, TiArrowRight } from "react-icons/ti";
import Notification from "../components/Notification";

function Forms() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const totalSteps = 6;
  const [answers, setAnswers] = useState([]);
  const [subQuestionIndex, setSubQuestionIndex] = useState(0);
  const [step6SubStep, setStep6SubStep] = useState(0);
  const [totalSubQuestions, setTotalSubQuestions] = useState(0);
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isStep5Valid, setIsStep5Valid] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showLeaveButton, setShowLeaveButton] = useState(true);

  const getQuestions = async () => {
    const response = await axiosUser.get("/questions/");
    return response.data;
  };
  // Carregar o progresso do localStorage quando o componente for montado
  useEffect(() => {
    const initialize = async () => {
      const savedStep = parseInt(localStorage.getItem("currentStep")) || 1;
      const savedSubQuestionIndex =
        parseInt(localStorage.getItem("subQuestionIndex")) || 0;
      const savedStep6SubStep =
        parseInt(localStorage.getItem("step6SubStep")) || 0;

      if (savedStep) {
        setCurrentStep(savedStep);
      }

      if (savedSubQuestionIndex && savedSubQuestionIndex>=0) {
        setSubQuestionIndex(savedSubQuestionIndex);
      }

      if (savedStep6SubStep !== undefined) {
        setStep6SubStep(savedStep6SubStep);
      }
      try {
          const qs = await getQuestions();
          setTotalSubQuestions(qs.length);
          const QA = qs.map((q) => ({ ...q, answers: null }));
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
    }
  }, [currentStep, subQuestionIndex, step6SubStep, answers, isInitialized]);

  // Calculate progress percentage for progress bar

  const progressPercentage =
    currentStep === 5
      ? Math.round((subQuestionIndex / totalSubQuestions) * 100)
      : 0;

  const handleNext = () => {
    // For Step 5, check if the current question has an answer before allowing to proceed
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
        setSubQuestionIndex(totalSubQuestions - 1); // Go back to the last question of step 5
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

    setIsNavigating(true);

    // Formatação da data para ISO string
    const storedStartDate = localStorage.getItem("Start Date");
    const startDate = storedStartDate ? new Date(storedStartDate) : new Date();
    const formattedDate = startDate.toISOString();

    // Make sure duration is at least 1 day
    const duration = Math.max(
      1,
      parseInt(localStorage.getItem("Duration")) || 1
    );

    console.log("User Ratings:", userRatings);

    const tripType = localStorage.getItem("Trip Type");
    let obj = {};

    //add an object related to the trip type an append it to the sending data for the backend attributes
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

    // Format must-visit places for API (List[PlaceInfo])
    const formattedMustVisitPlaces = mustVisitPlaces.map((obj) => obj.place);
    // Parse location for country and city
    const location = localStorage.getItem("Location") || "";
    let locationParts;
    let country;
    let city;

    if (localStorage.getItem("Trip Type") === "road") {
      // For road trips, use the destination text
      const destinationText = localStorage.getItem("currentTextDes") || "";
      locationParts = destinationText.split(",").map((part) => part.trim());
      country = locationParts[locationParts.length - 1] || null;
      city = locationParts[locationParts.length - 2] || null;
    } else {
      // For place and zone trips, use the original location parsing
      locationParts = location.split(",").map((part) => part.trim());
      country = locationParts[locationParts.length - 1] || null;
      city = locationParts[locationParts.length - 2] || null;
    }
    
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
      questions: {
        user123: userRatings.map((answer, index) => ({
          question_id: index,
          value: parseInt(answer) || 0, // Garantindo que o valor seja número
          type: "scale",
        })),
      },
    };

    console.log("Form data before sending:", formData);

    console.log("Sending data:", JSON.stringify(formData, null, 2)); // Para debug detalhado

    try {
      const response = await axiosInstance.post("/trips", formData);
      console.log("Response:", response.data);

      // Ensure we have the complete response data with the correct structure
      if (
        response.data &&
        response.data.response &&
        response.data.response.itinerary
      ) {
        //setItinerary(response.data);
        const tripId = response.data.response.tripId;
        navigate(`/itinerary/${tripId}`, {
          state: {
            itineraryData: response.data,
            userRatings: userRatings,
          },
        });

        // Instead of clearing all localStorage, just remove specific keys
        // but keep userRatings for the preference sidebar
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
          "route"
        ];

        keysToRemove.forEach((key) => localStorage.removeItem(key));

        answers.forEach((answer) => {
          answer.answer = null;
        });
        setAnswers([...answers]);
        setCurrentStep(1);
        setSubQuestionIndex(0);
        setStep6SubStep(0);
      } else {
        console.error("Invalid response structure:", response.data);
        setIsNavigating(false);
      }
    } catch (error) {
      if (error.response?.data) {
        console.error("Validation errors:", error.response.data);
      }
      console.error("Error submitting form:", error);
      setIsNavigating(false);
    }
  };

  if (!isInitialized || isNavigating) {
    return <LoadingItinerary />;
  }

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
              answers={answers}
              onRatingSelect={handleRatingSelect}
              onValidationChange={setIsStep5Valid}
              setShowLeaveButton={setShowLeaveButton}
              handleNext={handleNext}
              step6SubStep={step6SubStep}
            />

            {showError && (
              <Notification
                type="error"
                text="You must select an answer before proceeding"
                onClose={() => setShowError(false)}
              />
            )}

            <div className="flex justify-between mt-8">
              {currentStep === 1 && showLeaveButton && (
                <button
                  onClick={() => handleLeave()}
                  className="btn btn-primary"
                >
                  <BsArrowLeftSquareFill className="text-white" /> Leave
                </button>
              )}

              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-primary hover:text-rose-700 flex items-center"
                >
                  <TiArrowLeft className="mr-1" /> Back
                </button>
              )}

              {/* Modified Next/Finish button logic */}
              {(currentStep >= 3 && currentStep < 5) ||
              (currentStep === 5 &&
                subQuestionIndex < totalSubQuestions - 1) ? (
                <button
                  onClick={handleNext}
                  className={`ml-auto px-4 text-primary hover:text-rose-700 font-medium flex items-center ${
                    currentStep === 5 && !answers[subQuestionIndex]?.answer
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    currentStep === 5 && !answers[subQuestionIndex]?.answer
                  }
                >
                  Next <TiArrowRight className="ml-1" />
                </button>
              ) : currentStep === 5 ? (
                <button
                  onClick={handleNext}
                  className="ml-auto px-4 text-primary hover:text-rose-700 font-medium flex items-center"
                >
                  Next <TiArrowRight className="ml-1" />
                </button>
              ) : currentStep === 6 && step6SubStep === 0 ? (
                <button
                  onClick={handleNext}
                  className="ml-auto px-4 text-primary hover:text-rose-700 font-medium flex items-center"
                >
                  Next <TiArrowRight className="ml-1" />
                </button>
              ) : currentStep === 6 && step6SubStep === 1 ? (
                <button
                  onClick={handleNext}
                  className="ml-auto btn btn-primary"
                >
                  Finish
                </button>
              ) : null}
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
