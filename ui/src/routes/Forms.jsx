"use client"

import { useState } from "react"
import PageTemplate from "../components/PageTemplate"
import StepIndicator from "../components/StepIndicator"
import StepContent from "../components/forms/StepContent"
import VoyageLogo from "../assets/voyage-complete-logo-navy.png"

function Forms() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <PageTemplate>
      <div className="flex justify-center w-full">
        <div className="flex justify-center items-center flex-col w-full px-4">
          <div className="mb-4">
            <img src={VoyageLogo} alt="Voyage Logo" className="h-30" />
          </div>

          <StepIndicator currentStep={currentStep} totalSteps={totalSteps}/>

          <div className="bg-white rounded-md shadow-primary shadow-[0px_0px_20px_-13px] p-6 w-7xl mx-auto my-4 mt-15 ">
            <StepContent currentStep={currentStep} />

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button onClick={handleBack} className="px-4 py-2 text-primary hover:text-rose-700">
                  Back
                </button>
              )}
              {currentStep < totalSteps ? (
                <button onClick={handleNext} className="ml-auto px-4 py-2 text-primary hover:text-rose-700 font-medium">
                  Next →
                </button>
              ) : (
                <button className="ml-auto px-4 py-2 bg-primary text-white rounded hover:bg-rose-600 font-medium">
                  Complete
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

