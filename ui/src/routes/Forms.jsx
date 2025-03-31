"use client"
import { useState } from "react"
import PageTemplate from "../components/PageTemplate"
import StepIndicator from "../components/StepIndicator"
import StepContent from "../components/forms/StepContent"
import VoyageLogo from "../assets/voyage-complete-logo-navy.png"
import questions from "../../public/questions.json" 
import { Navigate, NavLink, useNavigate } from "react-router-dom"
import axios from "axios"

function Forms() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [answers, setAnswers] = useState([...questions]) 
  const [subQuestionIndex, setSubQuestionIndex] = useState(0)
  const totalSubQuestions = answers.length
  const navigate = useNavigate()

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

  const handleFinish = async () => {
    const formData = {
      budget: localStorage.getItem("Budget"),
      end_date: localStorage.getItem("End Date"),
      start_date: localStorage.getItem("Start Date"),
      location: localStorage.getItem("Location"),
      PreferencesProfile: localStorage.getItem("Preferences Profile"),
      TripDimension: localStorage.getItem("Trip Dimension"),
      TripType: localStorage.getItem("Trip Type"),
      user_tag: localStorage.getItem("user_tag") || "user1",
      user_questions: localStorage.getItem("userRatings").reduce((acc, answer, index) => {
        acc[`question${index + 1}`] = [{
          id: `question${index + 1}`,
          value: answer.answer,
          typeQuestion: 'rating',
        }];
        return acc;
      }, {}),

    };

    console.log(formData)
    try {
      const response = await axios.post("http://trip-management:8080/api/v1/submit_form/", formData)
      console.log(response);
      navigate("/itinerary")
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  };

  return (
    <PageTemplate>
      <div className="flex justify-center w-full">
        <div className="flex justify-center items-center flex-col w-full px-4">
          <div className="mb-4">
            <img src={VoyageLogo} alt="Voyage Logo" className="h-30" />
          </div>

          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          <div className="bg-white rounded-md shadow-primary shadow-[0px_0px_20px_-13px] p-6 w-7xl mx-auto my-4 mt-15">
            <StepContent
              currentStep={currentStep}
              subQuestionIndex={subQuestionIndex}
              totalSubQuestions={totalSubQuestions}
              answers={answers}
              onRatingSelect={handleRatingSelect}
            />

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-primary hover:text-rose-700"
                >
                  Back
                </button>
              )}
              
              {currentStep < totalSteps ||
              (currentStep === 5 && subQuestionIndex < totalSubQuestions - 1) ? (
                <button
                  onClick={handleNext}
                  className="ml-auto px-4 py-2 text-primary hover:text-rose-700 font-medium"
                >
                  Next →
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleFinish}> 
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}

export default Forms
