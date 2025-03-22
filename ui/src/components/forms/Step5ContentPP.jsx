import React from "react"

const Step5ContentPP = ({
  currentQuestion,
  subQuestionIndex,
  totalSubQuestions,
  onRatingSelect
}) => {
  if (!currentQuestion) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold mb-2">
          {currentQuestion.question}
        </h2>
        <p className="text-gray-500 text-sm">
          {currentQuestion.description}
        </p>
      </div>

      <div className="flex justify-center items-end mb-16">
        {[1, 2, 3, 4, 5, 6, 7].map(rating => (
          <div key={rating} className="flex flex-col items-center mx-2">
            <button
              onClick={() => onRatingSelect(rating)}
              className={`
                rounded-full border-2 border-red-400 
                flex items-center justify-center
                transition-all duration-200 hover:bg-red-100
                ${
                  rating === 1
                    ? 'w-16 h-16'
                    : rating === 2
                    ? 'w-14 h-14'
                    : rating === 3
                    ? 'w-12 h-12'
                    : rating === 4
                    ? 'w-10 h-10'
                    : rating === 5
                    ? 'w-12 h-12'
                    : rating === 6
                    ? 'w-14 h-14'
                    : 'w-16 h-16'
                }
                ${
                  currentQuestion.answer === rating
                    ? 'bg-red-500 border-red-500'
                    : 'bg-white'
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
      
      <div className="text-center text-gray-500">
        Question {subQuestionIndex + 1} of {totalSubQuestions}
      </div>
    </div>
  )
}

export default Step5ContentPP
