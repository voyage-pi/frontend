import React, { useEffect } from "react";

const Step5ContentPP = ({
  currentQuestion,
  subQuestionIndex,
  onRatingSelect,
}) => {
  useEffect(() => {
    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    const savedRating = savedRatings[subQuestionIndex];
    
    if (savedRating && currentQuestion && currentQuestion.answer !== savedRating) {
      onRatingSelect(savedRating);
    }
  }, [subQuestionIndex, currentQuestion, onRatingSelect]);

  if (!currentQuestion) return null;

  return (
    <div className="relative h-99 flex flex-col">
      <div className="max-w-2xl mx-auto p-3 flex flex-col items-center">
        <div className="text-center h-40 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">{currentQuestion.question}</h2>
          <p className="text-gray-500 text-md">{currentQuestion.description}</p>
        </div>
      </div>

      <div
        className="relative origin-center flex justify-center items-center"
      >
        {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
          <div key={rating} className="flex flex-col items-center mx-5">
            <button
              onClick={() => onRatingSelect(rating)}
              className={`rounded-full border-2 border-primary/70 flex items-center justify-center transition-all duration-200 hover:bg-primary/20
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
                          ${currentQuestion.answer === rating
                              ? "bg-primary border-primary"
                              : "bg-white"
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