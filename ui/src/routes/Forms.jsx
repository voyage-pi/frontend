import { useState, useEffect } from "react"
import PageTemplate from "../components/PageTemplate"
import StepIndicator from "../components/StepIndicator"
import StepContent from "../components/forms/StepContent"
import VoyageLogo from "../assets/voyage-complete-logo-navy.png"
import questions from "../../public/questions.json"
import { useNavigate } from "react-router-dom"
import { axiosInstance } from "../utils/axiosInstance"
import LoadingItinerary from "../components/LoadingItinerary"
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { TiArrowLeft, TiArrowRight } from "react-icons/ti";
import Notification from "../components/Notification";

function Forms() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const totalSteps = 6
  const [answers, setAnswers] = useState([...questions])
  const [subQuestionIndex, setSubQuestionIndex] = useState(0)
  const totalSubQuestions = answers.length
  const navigate = useNavigate()
  const [isNavigating, setIsNavigating] = useState(false)
  const [itinerary, setItinerary] = useState(null)
  const [isStep5Valid, setIsStep5Valid] = useState(false)
  const [showError, setShowError] = useState(false)
  const [showLeaveButton, setShowLeaveButton] = useState(true)


  // Carregar o progresso do localStorage quando o componente for montado
  useEffect(() => {
    const savedStep = parseInt(localStorage.getItem("currentStep")) || 1;
    const savedSubQuestionIndex =
      parseInt(localStorage.getItem("subQuestionIndex")) || 0;
    const savedAnswers = JSON.parse(localStorage.getItem("answers"));

    if (savedStep) {
      setCurrentStep(savedStep);
    }

    if (savedSubQuestionIndex) {
      setSubQuestionIndex(savedSubQuestionIndex);
    }

    if (savedAnswers && Array.isArray(savedAnswers) && savedAnswers.length > 0) {
      setAnswers(savedAnswers);
    }else{
      setAnswers(answers);
    }

    setIsInitialized(true);
  }, []);

  // Salvar o progresso no localStorage sempre que mudar
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("currentStep", currentStep);
      localStorage.setItem("subQuestionIndex", subQuestionIndex);
      localStorage.setItem("answers", JSON.stringify(answers));
    }
  }, [currentStep, subQuestionIndex, answers, isInitialized]);

  // Calculate progress percentage for progress bar

  const progressPercentage = currentStep === 5
    ? Math.round(((subQuestionIndex) / totalSubQuestions) * 100)
    : 0;


  const handleNext = () => {
    // For Step 5, check if the current question has an answer before allowing to proceed
    if (currentStep === 5) {
      // Check if current question has an answer
      const currentQuestionHasAnswer = answers[subQuestionIndex]?.answer !== undefined;
      
      // If trying to proceed without an answer, show error
      if (!currentQuestionHasAnswer) {
        setShowError(true);
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (currentStep === 5) {
      if (subQuestionIndex < totalSubQuestions - 1) {
        setSubQuestionIndex(subQuestionIndex + 1);
      } else {
        // When all questions in step 5 are done, go to step 6
        setCurrentStep(currentStep + 1);
      }
      return;
    }
    
    if (currentStep === 6) {
      // We're at the must-visit places step, no special validation needed
      console.log("All done with must-visit places.");
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
        setCurrentStep(currentStep - 1);
      }
    }
    
    if (currentStep === 6) {
      setCurrentStep(currentStep - 1);
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
    const mustVisitPlaces = JSON.parse(localStorage.getItem("MustVisitPlaces")) || [];

    setIsNavigating(true);

    // Formatação da data para ISO string
    const startDate = new Date(localStorage.getItem("Start Date"));
    const formattedDate = startDate.toISOString();

    console.log("User Ratings:", userRatings);
    console.log("Must Visit Places:", mustVisitPlaces);
    
    const tripType = localStorage.getItem("Trip Type")
    let obj = {}
    //add an object related to the trip type an append it to the sending data for the backend attributes
    if (tripType === "zone") {
      obj.radius = localStorage.getItem("radius")
      obj.center = {
        latitude: parseFloat(localStorage.getItem("Latitude")) || 0,
        longitude: parseFloat(localStorage.getItem("Longitude")) || 0
      }
    }
    else if (tripType == "place") {
      obj.coordinates = {
        latitude: parseFloat(localStorage.getItem("Latitude")) || 0,
        longitude: parseFloat(localStorage.getItem("Longitude")) || 0
      }
      obj.place_name = localStorage.getItem("Location")
    }

    // Format must-visit places for API
    const formattedMustVisitPlaces = mustVisitPlaces.map(place => ({
      name: place.name,
      latitude: place.position.lat,
      longitude: place.position.lng
    }));

    const formData = {
      budget: parseFloat(localStorage.getItem("Budget")) || 0,
      dateStart: formattedDate,
      duration: parseInt(localStorage.getItem("Duration")) || 0,
      tripType: tripType,
      users: ["user123"],
      display_name: localStorage.getItem("Location"),
      data_type: obj,
      must_visit_places: formattedMustVisitPlaces,
      questions: {
        user123: userRatings.map((answer, index) => ({
          question_id: index,
          value: parseInt(answer) || 0, // Garantindo que o valor seja número
          type: "scale",
        })),
      },
    };

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
        setItinerary(response.data);
        const tripId = response.data.response.tripId;
        navigate(`/itinerary/${tripId}`, { 
          state: { 
            itineraryData: response.data,
            userRatings: userRatings 
          } 
        });
        
        // Instead of clearing all localStorage, just remove specific keys
        // but keep userRatings for the preference sidebar
        const keysToRemove = [
          "currentStep", "subQuestionIndex", "answers", 
          "Start Date", "Trip Type", "radius", "Latitude", 
          "Longitude", "Location", "Budget", "Duration"
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        answers.forEach(answer => {
          answer.answer = null;
        });
        setAnswers([...answers]);
        setCurrentStep(1);
        setSubQuestionIndex(0);
        
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

              {(currentStep >= 3 && currentStep < 5) ||
                (currentStep === 5 && subQuestionIndex < totalSubQuestions - 1) ? (
                <button
                  onClick={handleNext}
                  className={`ml-auto px-4 text-primary hover:text-rose-700 font-medium flex items-center ${currentStep === 5 && !answers[subQuestionIndex]?.answer ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={currentStep === 5 && !answers[subQuestionIndex]?.answer}
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
              ) : currentStep === 6 ? (
                <button className="btn btn-primary" onClick={handleFinish}>
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

export default Forms

