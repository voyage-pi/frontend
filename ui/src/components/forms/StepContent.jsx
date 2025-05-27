import React from "react"
import Step1 from "./Step1Content"
import Step2 from "./Step2Content"
import Step3 from "./Step3Content"
import Step4 from "./Step4Content"
import Step5Content from "./Step5Content"
import Step6Content from "./Step6Content"

const StepContent = ({
  currentStep,
  setCurrentStep,
  subQuestionIndex,
  totalSubQuestions,
  answers,
  setSubQuestionIndex,
  setDisableButton,
  onRatingSelect,
  onValidationChange,
  setShowLeaveButton,
  handleNext,
  step6SubStep,
  setIsGroup,
  addedUsers,
  setAddedUsers
}) => {
  switch (currentStep) {
    case 1:
      return <Step1 setCurrentStep={setCurrentStep} setShowLeaveButton={setShowLeaveButton} setIsGroup={setIsGroup} addedUsers={addedUsers} setAddedUsers={setAddedUsers} />
    case 2:
      return <Step2 setCurrentStep={setCurrentStep} />
    case 3:
      return <Step3 setDisableButton={setDisableButton} setCurrentStep={setCurrentStep} />
    case 4:
      return <Step4 />
    case 5:
      return (
        <Step5Content
          setSubQuestionIndex={setSubQuestionIndex}
          setCurrentStep={setCurrentStep}
          subQuestionIndex={subQuestionIndex}
          totalSubQuestions={totalSubQuestions}
          answers={answers}
          setDisableButton={setDisableButton}
          onRatingSelect={onRatingSelect}
          onValidationChange={onValidationChange}
          handleNext={handleNext}
        />
      )
    case 6:
      return <Step6Content step6SubStep={step6SubStep} />
    default:
      return <div>Invalid step</div>
  }
}

export default StepContent