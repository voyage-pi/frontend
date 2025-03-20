import React from 'react';
import Step1Content from './Step1Content';
import Step2Content from './Step2Content';
import Step3Content from './Step3Content';
import Step4Content from './Step4Content';
import Step5Content from './Step5Content';

const StepContent = ({ currentStep }) => {
  switch (currentStep) {
    case 1:
      return <Step1Content />;
    case 2:
      return <Step2Content />;
    case 3:
      return <Step3Content />;
    case 4:
      return <Step4Content />;
    case 5:
      return <Step5Content />;
    default:
      return <Step1Content />;
  }
};

export default StepContent;