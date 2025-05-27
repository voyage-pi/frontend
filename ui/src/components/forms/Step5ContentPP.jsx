import React, { useEffect, useState } from "react";
import Notification from "../Notification";

const Step5ContentPP = ({
  currentQuestion,
  subQuestionIndex,
  onRatingSelect,
  onValidationChange,
  handleNext,
  totalSubQuestions
}) => {
  const [showError, setShowError] = useState(false);
  const [showLastQuestionInfo, setShowLastQuestionInfo] = useState(false);
  const isLastQuestion = subQuestionIndex === totalSubQuestions - 1;

  useEffect(() => {
    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    const savedRating = savedRatings[subQuestionIndex];

    if (savedRating !== undefined && currentQuestion && currentQuestion.answer !== savedRating) {
      onRatingSelect(savedRating);
    }
  }, [subQuestionIndex, currentQuestion, onRatingSelect]);

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(currentQuestion?.answer !== undefined);
    }
  }, [currentQuestion?.answer, onValidationChange]);

  const handleRatingClick = (rating) => {
    if (currentQuestion.answer === rating) {
      onRatingSelect(undefined);
      if (onValidationChange) {
        onValidationChange(false);
      }
    } else {
      onRatingSelect(rating);
      
      if (onValidationChange) {
        onValidationChange(true);
      }
      
      if (handleNext) {
        setTimeout(() => {
          handleNext();
        }, 300);
      }
    }
  };

  // Local handler for Next button click in case user tries to use it
  const validateBeforeNext = () => {
    if (!currentQuestion?.answer) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
      return false;
    }
    return true;
  };

  if (!currentQuestion) return null;

  return (
    <div className="relative h-99 flex flex-col">
      {showError && (
        <Notification
          type="error"
          text="You must select an answer before proceeding"
          onClose={() => setShowError(false)}
        />
      )}
      {showLastQuestionInfo && (
        <Notification
          type="info"
          text="This is the last question. Please press the Finish button to complete your trip."
          onClose={() => setShowLastQuestionInfo(false)}
        />
      )}
      <div className="max-w-2xl mx-auto p-3 flex flex-col items-center">
        <div className="text-center h-40 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">{currentQuestion.question}</h2>
          <p className="text-gray-500 text-md">{currentQuestion.description}</p>
        </div>
      </div>

      <div className="relative origin-center flex justify-center items-center">
        {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
          <div key={rating} className="flex flex-col items-center mx-5">
            <button
              onClick={() => handleRatingClick(rating)}
              className={`rounded-full border-2 border-primary/70 flex items-center justify-center transition-all duration-200 
                          ${currentQuestion.answer === rating
                  ? "bg-primary border-primary"
                  : "bg-white hover:bg-primary/20"
                }
                          ${rating === 1
                  ? "w-18 h-18"
                  : rating === 2
                    ? "w-16 h-16"
                    : rating === 3
                      ? "w-14 h-14"
                      : rating === 4
                        ? "w-12 h-12"
                        : rating === 5
                          ? "w-14 h-14"
                          : rating === 6
                            ? "w-16 h-16"
                            : "w-18 h-18"
                }
                        `}
            >
              {currentQuestion.answer === rating && (
                <span className="sr-only">Selected</span>
              )}
            </button>
            <span className="mt-2 text-gray-600">{rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step5ContentPP;
