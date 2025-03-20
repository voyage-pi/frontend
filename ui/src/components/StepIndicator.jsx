import React, { useEffect, useState, useRef } from 'react';

const StepIndicator = ({ currentStep, totalSteps }) => {
  const [lineProgress, setLineProgress] = useState(100);
  const [circleActive, setCircleActive] = useState(true);
  const [initialRender, setInitialRender] = useState(true);
  const prevStepRef = useRef(currentStep);
  
  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      prevStepRef.current = currentStep;
      return;
    }
    
    const isMovingForward = currentStep > prevStepRef.current;
    const isMovingBackward = currentStep < prevStepRef.current;
    
    if (isMovingForward) {
      setLineProgress(0);
      setCircleActive(false);
      
      const lineTimer = setTimeout(() => {
        setLineProgress(100);
      }, 50);
      
      const circleTimer = setTimeout(() => {
        setCircleActive(true);
      }, 300);
      
      return () => {
        clearTimeout(lineTimer);
        clearTimeout(circleTimer);
      };
    } else if (isMovingBackward) {
      setCircleActive(false);
      setLineProgress(0);
    }
    
    prevStepRef.current = currentStep;
  }, [currentStep, initialRender]);

  return (
    <div className="flex items-center justify-center w-full">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;
        
        const isConnectorBeforeCurrent = stepNumber === currentStep - 1;
        
        return (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <div 
              className={`relative flex items-center justify-center w-12 h-12 rounded-full border-1 transition-all duration-100 ease-in-out
                ${(isCompleted || (isCurrent && (circleActive || initialRender)))
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-rose-200 border-rose-400'}`}
            >
              {/* Avoid key changes to prevent flashing */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold transition-colors duration-300
                  ${isUpcoming || (isCurrent && !circleActive && !initialRender) 
                    ? 'text-rose-400' 
                    : 'text-white'}`}
                >
                  {stepNumber}
                </span>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div className="relative w-16 h-1 mx-1 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-rose-100"></div>
                
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-400 ease-in-out"
                  style={{ 
                    width: isCompleted 
                      ? '100%' 
                      : (isConnectorBeforeCurrent ? `${lineProgress}%` : '0%')
                  }}
                ></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;