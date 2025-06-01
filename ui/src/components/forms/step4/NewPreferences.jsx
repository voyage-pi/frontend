import { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import Step5ContentPP from "../Step5ContentPP";
import Notification from "../../Notification";
import { useAuth } from "../../../context/AuthContext";

const NewPreferences = ({ questionsStep5, setDisableButton ,setForward,forward}) => {
  const [name, setName] = useState(null);
  const [notification, setNotification] = useState(null);
  const { isAuthenticated } = useAuth();
  
  const newPrefName = () => {
    if (name == null || name.length <= 3) {
      setNotification(
        <Notification
          type="info"
          text="Input field must not be empty"
          onClose={() => setNotification(null)}
        />
      );
      return;
    }
    localStorage.setItem("preferencesName", name);
    setForward(true);
  };
  useEffect(() => {
    // check if the current questions is already answered if so enable the button
    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    if (forward && questionsStep5.currentQuestion) {
      if (savedRatings[questionsStep5.subQuestionIndex] !== undefined) {
        setDisableButton(false);
      } else {
        setDisableButton(true);

      }
    }
  }, [forward, questionsStep5.currentQuestion, questionsStep5.subQuestionIndex, setDisableButton]);


  // For unauthenticated users, show questions directly
  // For authenticated users, show name input first, then questions after name is entered
  const shouldShowQuestions = !isAuthenticated || forward;

  return (
    <>
      {notification}
      {!shouldShowQuestions ? (
        <div className="text-center p-6 -mb-10">
          <h2 className="text-3xl mb-10">
            Set a name for your preferences profile!
          </h2>
          <div className="p-6 flex justify-center text-center">
            <input
              className="input bg-white w-4/5 pr-4 rounded-full text-lg shadow-sm focus:border-transparent"
              placeholder="Barcelona, adventure"
              type="text"
              onChange={(e) => {
                setName(e.target.value);
                localStorage.setItem("preferencesName", e.target.value);
              }}
            />
            <button
              onClick={newPrefName}
              className="rounded-full bg-primary text-white text-center p-1 m-3"
            >
              <FaArrowRight className="text-white mx-auto" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Profile name must be at least 4 letters long</p>
        </div>
      ) : (
        <Step5ContentPP
          currentQuestion={questionsStep5.currentQuestion}
          subQuestionIndex={questionsStep5.subQuestionIndex}
          totalSubQuestions={questionsStep5.totalSubQuestions}
          onRatingSelect={questionsStep5.handleRatingSelect}
          onValidationChange={questionsStep5.handleValidationChange}
          handleNext={questionsStep5.handleNext}
        />
      )}
    </>
  );
};

export default NewPreferences;
