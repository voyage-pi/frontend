import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import Step5ContentPP from "../Step5ContentPP";
import Notification from "../../Notification";
import { useAuth } from "../../../context/AuthContext";

const NewPreferences = ({ questionsStep5 }) => {
  const [name, setName] = useState(null);
  const [forward, setForward] = useState(false);
  const [notification, setNotification] = useState(null);
  const {isAuthenticated} = useAuth()
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
  return (
    <>
      {notification}
      {!forward && isAuthenticated ? (
        <div className="text-center p-6 -mb-10">
          <h2 className="text-3xl mb-10">
            Set a name for you preferences profile!
          </h2>
          <div className="p-6 flex justify-center text-center">
            <input
              className="input bg-white w-4/5 pr-4 rounded-full text-lg shadow-sm focus:border-transparent"
              placeholder="Barcelona, adventurous"
              type="text"
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={newPrefName}
              className="rounded-full bg-primary text-white text-center p-1 m-3"
            >
              <FaArrowRight className="text-white mx-auto" />
            </button>
          </div>
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
