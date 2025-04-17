import React from "react"
import Step1 from "./Step1Content"
import Step2 from "./Step2Content"
import Step3 from "./Step3Content"
import Step4 from "./Step4Content"
import Step5Content from "./Step5Content"

const StepContent = ({
  currentStep,
  setCurrentStep,
  subQuestionIndex,
  totalSubQuestions,
  answers,
  onRatingSelect,
  onValidationChange,
  setShowLeaveButton
}) => {
  switch (currentStep) {
    case 1:
      return <Step1 setCurrentStep={setCurrentStep} setShowLeaveButton={setShowLeaveButton} />
    case 2:
      return <Step2 setCurrentStep={setCurrentStep} />
    case 3:
      return <Step3 setCurrentStep={setCurrentStep} />
    case 4:
      return <Step4 />
    case 5:
      return (
        <Step5Content
          subQuestionIndex={subQuestionIndex}
          totalSubQuestions={totalSubQuestions}
          answers={answers}
          onRatingSelect={onRatingSelect}
          onValidationChange={onValidationChange}
        />
      )
    default:
      return <div>Invalid step</div>
  }
}

export default StepContent