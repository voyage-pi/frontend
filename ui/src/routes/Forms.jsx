"use client"

import { useState } from "react"
import PageTemplate from "../components/PageTemplate"
import StepIndicator from "../components/StepIndicator"
import StepContent from "../components/forms/StepContent"
import VoyageLogo from "../assets/voyage-complete-logo-navy.png"
import questions from "../../public/questions.json" 
import { NavLink } from "react-router-dom"

function Forms() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [answers, setAnswers] = useState([...questions]) 
  const [subQuestionIndex, setSubQuestionIndex] = useState(0)
  const totalSubQuestions = answers.length
  
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
                <NavLink className="btn btn-primary" to="/itinerary"> 
                  Finish
                </NavLink>
              )}
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