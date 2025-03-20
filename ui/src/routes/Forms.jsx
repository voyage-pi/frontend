import React, { useState } from 'react';
import PageTemplate from "../components/PageTemplate";
import StepIndicator from "../components/StepIndicator";
import StepContent from "../components/forms/StepContent";

function Forms() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <PageTemplate>
      {/* Logo */}
      {/* <div className="flex justify-center mb-4">
        <img src="/path-to-your-logo.png" alt="Voyage Logo" className="h-8" />
      </div> */}
      
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      
      {/* Card Content */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto my-4 min-h-64">
        <StepContent currentStep={currentStep} />
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button 
              onClick={handleBack}
              className="px-4 py-2 text-rose-500 hover:text-rose-700"
            >
              Back
            </button>
          )}
          {currentStep < totalSteps ? (
            <button 
              onClick={handleNext}
              className="ml-auto px-4 py-2 text-rose-500 hover:text-rose-700 font-medium"
            >
              Next →
            </button>
          ) : (
            <button 
              className="ml-auto px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 font-medium"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}

export default Forms;