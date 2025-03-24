import React from "react"
import Step1 from "./Step1Content"
import Step2 from "./Step2Content"
import Step3 from "./Step3Content"
import Step4 from "./Step4Content"
import Step5Content from "./Step5Content"

const StepContent = ({
  currentStep,
  subQuestionIndex,
  totalSubQuestions,
  answers,
  onRatingSelect
}) => {
  switch (currentStep) {
    case 1:
      return <Step1 />
    case 2:
      return <Step2 />
    case 3:
      return <Step3 />
    case 4:
      return <Step4 />
    case 5:
      return (
        <Step5Content
          subQuestionIndex={subQuestionIndex}
          totalSubQuestions={totalSubQuestions}
          answers={answers}
          onRatingSelect={onRatingSelect}
        />
      )
    default:
      return <div>Invalid step</div>
  }
}

export default StepContent
