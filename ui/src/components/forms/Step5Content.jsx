import { useState, useEffect } from "react";
import { FaFileCirclePlus, FaRecycle, FaCircleInfo } from "react-icons/fa6";
import FormCard from "./FormCard";
import { useAuth } from "../../context/AuthContext";
import NewPreferences from "./step4/NewPreferences";
import OldPreferences from "./step4/OldPreferences";

function Step5Content({
  setSubQuestionIndex,
  subQuestionIndex,
  totalSubQuestions,
  answers,
  onRatingSelect,
  setCurrentStep,
  setDisableButton,
  onValidationChange,
  handleNext,
}) {
  const [isValid, setIsValid] = useState(false);
  const [showNewPreferences, setShowNewPreferences] = useState(null);
  const [tripDimension, setTripDimension] = useState("individual");
  const [forward, setForward] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if trip dimension is saved in localStorage
    const savedTripDimension = localStorage.getItem("Trip Dimension");
    if (savedTripDimension) {
      setTripDimension(savedTripDimension);
    }
    
    // Check if preferences profile choice already exists
    const preferencesProfile = localStorage.getItem("Preferences Profile");

    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];

    // If a profile already exists as "New" or if there are ratings for the current question
    if (preferencesProfile === "New" || savedRatings[subQuestionIndex]) {
      // verify if the user is logged in otherwise just continue, for preferences saving
      if (!isAuthenticated) {
        setShowNewPreferences(true);
        setForward(true);
      }
    }
    else
    {
      // If no profile exists, show the options to create a new one or reuse an old one
      setShowNewPreferences(null);
      setDisableButton(true); // Disable the button until a choice is made
    }

  }, []);

  const handleRatingSelect = (rating) => {
    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    savedRatings[subQuestionIndex] = rating; // Set the rating for the current question
    localStorage.setItem("userRatings", JSON.stringify(savedRatings)); // Save the updated array

    if (onRatingSelect) {
      onRatingSelect(rating);
    }
  };

  const handleValidationChange = (isValid) => {
    setIsValid(isValid);
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  };
  if (showNewPreferences !== null) {
    if (showNewPreferences) {
      const currentQuestion = answers[subQuestionIndex];
      return (
        <NewPreferences
          forward={forward}
          setForward={setForward}
          setDisableButton={setDisableButton}
          questionsStep5={{
            currentQuestion,
            setSubQuestionIndex,
            subQuestionIndex,
            totalSubQuestions,
            handleRatingSelect,
            handleValidationChange,
            handleNext,

          }}
        />
      );
    } else if (!showNewPreferences) {
      return <OldPreferences  answers={answers} setCurrentStep={setCurrentStep} setDisableButton={setDisableButton}/>;
    }
  }
  else{
  setDisableButton(true);
  const individualCardData = [
    {
      id: "reuse",
      icon: FaRecycle,
      title: "Reuse Preferences Profile",
      onClick: () => {
        setShowNewPreferences(false)
        localStorage.setItem("Preferences Profile", "Old");
      },
    },
    {
      id: "new",
      icon: FaFileCirclePlus,
      title: "New Preferences Profile",
      onClick: () => {
        setShowNewPreferences(true);
        localStorage.setItem("Preferences Profile", "New");
      },
    },
  ];

  return (
    <div className="text-center p-6 -mb-10">
      <div className="flex justify-center space-x-40 pt-9">
        {individualCardData.map((card) => (
          <FormCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            selected={false}
            onClick={card.onClick || (() => {})}
            iconSize={100}
            infoSize={25}
            text={card.text}
            id={card.id}
          />
        ))}
      </div>
    </div>
  );
  }

}
export default Step5Content;
