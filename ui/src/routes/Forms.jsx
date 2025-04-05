import { useState, useEffect } from "react"
import PageTemplate from "../components/PageTemplate"
import StepIndicator from "../components/StepIndicator"
import StepContent from "../components/forms/StepContent"
import VoyageLogo from "../assets/voyage-complete-logo-navy.png"
import questions from "../../public/questions.json"
import { useNavigate } from "react-router-dom"
import {axiosInstance } from "../utils/axiosInstance"
import LoadingItinerary from "../components/LoadingItinerary"
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { TiArrowLeft, TiArrowRight } from "react-icons/ti";

function Forms() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const totalSteps = 5
  const [answers, setAnswers] = useState([...questions])
  const [subQuestionIndex, setSubQuestionIndex] = useState(0)
  const totalSubQuestions = answers.length
  const navigate = useNavigate()
  const [isNavigating, setIsNavigating] = useState(false)


  // Carregar o progresso do localStorage quando o componente for montado
  useEffect(() => {
    const savedStep = parseInt(localStorage.getItem("currentStep")) || 1
    const savedSubQuestionIndex = parseInt(localStorage.getItem("subQuestionIndex")) || 0
    const savedAnswers = JSON.parse(localStorage.getItem("answers"))

    if (savedStep) {
      setCurrentStep(savedStep)
    }

    if (savedSubQuestionIndex) {
      setSubQuestionIndex(savedSubQuestionIndex)
    }

    if (savedAnswers) {
      setAnswers(savedAnswers)
    }

    setIsInitialized(true)
  }, [])

  // Salvar o progresso no localStorage sempre que mudar
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("currentStep", currentStep)
      localStorage.setItem("subQuestionIndex", subQuestionIndex)
      localStorage.setItem("answers", JSON.stringify(answers))
    }
  }, [currentStep, subQuestionIndex, answers, isInitialized])

  // Calculate progress percentage for progress bar
  const progressPercentage = currentStep === 5
    ? Math.round(((subQuestionIndex + 1) / totalSubQuestions) * 100)
    : 0;

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      return
    }

    if (currentStep === 5) {
      if (subQuestionIndex < totalSubQuestions - 1) {
        setSubQuestionIndex(subQuestionIndex + 1)
      } else {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1)
        } else {
          console.log("All done with step 5 questions.")
        }
      }
    }
  }

  const handleBack = () => {
    if (currentStep === 1) return

    if (currentStep < 5) {
      setCurrentStep(currentStep - 1)
      return
    }

    if (currentStep === 5) {
      if (subQuestionIndex > 0) {
        setSubQuestionIndex(subQuestionIndex - 1)
      } else {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  const handleRatingSelect = (rating) => {
    setAnswers((prevAnswers) => {
      const updated = [...prevAnswers]
      updated[subQuestionIndex].answer = rating
      return updated
    })
  }

  const handleLeave = () => {
    navigate("/")
  }

  const handleFinish = async () => {
    const userRatings = JSON.parse(localStorage.getItem("userRatings")) || [];

    setIsNavigating(true)

    // Formatação da data para ISO string
    const startDate = new Date(localStorage.getItem("Start Date"));
    const formattedDate = startDate.toISOString();

    console.log("User Ratings:", userRatings);

    const formData = {
      budget: parseFloat(localStorage.getItem("Budget")) || 0,
      dateStart: formattedDate, // Formato correto: "2025-04-15T09:00:00Z"
      duration: parseInt(localStorage.getItem("Duration")) || 0,
      tripType: localStorage.getItem("Trip Type") || "place",
      users: ["user123"],
      place: {
        coordinates: {
          latitude: 40.6399647406503,
          longitude: -8.65505658124174
        }
      },
      questions: {
        "user123": userRatings.map((answer, index) => ({
          question_id: index,
          value: parseInt(answer) || 0, // Garantindo que o valor seja número
          type: "scale"
        }))
      }
    };

    console.log("Sending data:", JSON.stringify(formData, null, 2)); // Para debug detalhado


    try {
      const response = await axiosInstance.post("/trips/", formData);
       console.log("Response:", response.data);
       navigate("/itinerary");
     } catch (error) {
       if (error.response?.data) {
         console.error("Validation errors:", error.response.data);
       }
       console.error("Error submitting form:", error);
     }

    setTimeout(() => {
      navigate("/itinerary")
    }, 1000)
  };

  if (!isInitialized || isNavigating) {
    return <LoadingItinerary />
  }

  return (
    <PageTemplate>
      <div className="flex justify-center w-full">
        <div className="flex justify-center items-center flex-col w-full px-4">
          <div className="mb-4">
            <img src={VoyageLogo} alt="Voyage Logo" className="h-30" />
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
            />

            <div className="flex justify-between mt-8">
              {currentStep === 1 && (
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
                  <TiArrowLeft className="mr-1"/> Back
                </button>
              )}

              {(currentStep >= 3 && currentStep < 5) || 
                (currentStep === 5 && subQuestionIndex < totalSubQuestions - 1) ? (
                  <button
                    onClick={handleNext}
                    className="ml-auto px-4 text-primary hover:text-rose-700 font-medium flex items-center"
                  >
                    Next <TiArrowRight className="ml-1"/>
                  </button>
                ) : currentStep === 5 ? (
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
  )
}

export default Forms