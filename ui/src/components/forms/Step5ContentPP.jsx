import React, { useState } from 'react';
import questions from "../../../public/questions.json"

const Step5ContentPP = () => {

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [preferences, setPreferences] = useState(
    questions.map(q => ({ ...q }))
  );

  const handleRatingSelect = (rating) => {
    const updatedPreferences = [...preferences];
    updatedPreferences[currentQuestion].answer = rating;
    setPreferences(updatedPreferences);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  // Get the current question data
  const currentQuestionData = preferences[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold mb-2">
          {currentQuestionData.question}
        </h2>
        <p className="text-gray-500 text-sm">
          {currentQuestionData.description}
        </p>
      </div>

      <div className="flex justify-center items-end mb-16">
        {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
          <div key={rating} className="flex flex-col items-center mx-2">
            <button
              onClick={() => handleRatingSelect(rating)}
              className={`rounded-full border-2 border-red-400 flex items-center justify-center transition-all duration-200 hover:bg-red-100 ${
                rating === 1 ? 'w-16 h-16' : 
                rating === 2 ? 'w-14 h-14' : 
                rating === 3 ? 'w-12 h-12' : 
                rating === 4 ? 'w-10 h-10' : 
                rating === 5 ? 'w-12 h-12' : 
                rating === 6 ? 'w-14 h-14' : 'w-16 h-16'
              } ${
                currentQuestionData.answer === rating ? 'bg-red-500 border-red-500' : 'bg-white'
              }`}
              aria-label={`Rating ${rating}`}
            >
              {currentQuestionData.answer === rating && (
                <span className="sr-only">Selected</span>
              )}
            </button>
            <span className="mt-2 text-gray-600">{rating}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={goToPreviousQuestion}
          className={`flex items-center text-red-400 ${isFirstQuestion ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600'}`}
          disabled={isFirstQuestion}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        
        <div className="text-gray-400 text-sm">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        
        <button
          onClick={goToNextQuestion}
          className={`flex items-center text-red-400 ${isLastQuestion ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600'}`}
          disabled={isLastQuestion}
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step5ContentPP;