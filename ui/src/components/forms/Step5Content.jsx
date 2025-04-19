import { useState, useEffect } from "react";
import { FaFileCirclePlus, FaRecycle, FaCircleInfo } from "react-icons/fa6";
import { FaUser, FaUserGroup } from "react-icons/fa6";
import Step5ContentPP from "./Step5ContentPP";
import FormCard from "./FormCard";

function Step5Content({subQuestionIndex, totalSubQuestions, answers, onRatingSelect, setCurrentStep, onValidationChange, handleNext}) {
  const [showNewPreferences, setShowNewPreferences] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [tripDimension, setTripDimension] = useState('individual');

  useEffect(() => {
    // Check if trip dimension is saved in localStorage
    const savedTripDimension = localStorage.getItem("Trip Dimension");
    if (savedTripDimension) {
      setTripDimension(savedTripDimension);
    }
    
    // Check if preferences profile already exists
    const preferencesProfile = localStorage.getItem("Preferences Profile");
    
    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    
    // If a profile already exists as "New" or if there are ratings for the current question
    if (preferencesProfile === "New" || savedRatings[subQuestionIndex]) {
      setShowNewPreferences(true);
    }
  }, [subQuestionIndex]);

  const handleNewPreferencesClick = () => {
    setShowNewPreferences(true);
    localStorage.setItem("Preferences Profile", "New");
  };

  const handleSingularTasteClick = () => {
    setShowNewPreferences(true);
    localStorage.setItem("Preferences Profile", "Singular");
  };

  const handleCombinedGroupClick = () => {
    setShowNewPreferences(true);
    localStorage.setItem("Preferences Profile", "Combined");
  };

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

  if (showNewPreferences) {
    const currentQuestion = answers[subQuestionIndex];
    return (
      <div className="p-6">
        <Step5ContentPP
          currentQuestion={currentQuestion}
          subQuestionIndex={subQuestionIndex}
          totalSubQuestions={totalSubQuestions}
          onRatingSelect={handleRatingSelect}
          onValidationChange={handleValidationChange}
          handleNext={handleNext}
        />
      </div>
    );
  }

  // Different options based on trip dimension
  if (tripDimension === 'group') {
    const groupCardData = [
      {
        id: 'singular',
        icon: FaUser,
        title: 'Singular Taste Profile',
        onClick: handleSingularTasteClick,
        text: 'Create a single preference profile for the entire group based on one person\'s choices. This is useful when one person is making decisions for the group or when the group has similar preferences.'
      },
      {
        id: 'combined',
        icon: FaUserGroup,
        title: 'Combined Group Preferences',
        onClick: handleCombinedGroupClick,
        text: 'Create a combined profile that takes into account preferences from all group members. This option is ideal for groups with diverse tastes, ensuring that recommendations satisfy the majority of the group.'
      },
    ];

    return (
      <div className="text-center p-6 -mb-10">
        <div className="flex justify-center space-x-40 pt-9">
          {groupCardData.map((card) => (
            <FormCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              selected={false}
              onClick={card.onClick}
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

  // Default options for individual trips
  const individualCardData = [
    {
      id: 'reuse',
      icon: FaRecycle,
      title: 'Reuse Preferences Profile',
    },
    {
      id: 'new',
      icon: FaFileCirclePlus,
      title: 'New Preferences Profile',
      onClick: handleNewPreferencesClick,
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
            onClick={card.onClick || (() => { })} 
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

export default Step5Content;
