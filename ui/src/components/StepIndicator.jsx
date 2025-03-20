import React from 'react';

const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center w-full max-w-3xl mx-auto my-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          {/* Step Circle */}
          <div 
            className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 
              ${index + 1 === currentStep 
                ? 'bg-rose-500 text-white border-rose-500' 
                : 'bg-white text-rose-500 border-rose-500'}`}
          >
            <span className="text-lg font-bold">{index + 1}</span>
          </div>
          
          {/* Connector Line (except after last step) */}
          {index < totalSteps - 1 && (
            <div className="w-12 h-px bg-rose-200"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;