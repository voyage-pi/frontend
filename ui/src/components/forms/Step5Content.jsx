import { useState, useEffect } from "react";
import { FaFileCirclePlus, FaRecycle, FaCircleInfo } from "react-icons/fa6";
import Step5ContentPP from "./Step5ContentPP";
import FormCard from "./FormCard";

function Step5Content({subQuestionIndex,totalSubQuestions,answers,onRatingSelect,}) {
  const [showNewPreferences, setShowNewPreferences] = useState(false);

  useEffect(() => {
    // Verificar se já existe um perfil de preferências salvo
    const preferencesProfile = localStorage.getItem("Preferences Profile");
    
    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    
    // Se já existe um perfil "New" ou se há avaliações para a pergunta atual
    if (preferencesProfile === "New" || savedRatings[subQuestionIndex]) {
      setShowNewPreferences(true);
    }
  }, [subQuestionIndex]);

  const handleNewPreferencesClick = () => {
    setShowNewPreferences(true);
    localStorage.setItem("Preferences Profile", "New");
  };

  const handleRatingSelect = (rating) => {
    const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || [];
    savedRatings[subQuestionIndex] = rating; // Set the rating for the current question
    localStorage.setItem("userRatings", JSON.stringify(savedRatings)); // Save the updated array

    if (onRatingSelect) {
      onRatingSelect(rating); 
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
        />
      </div>
    );
  }

  const cardData = [
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
        {cardData.map((card) => (
          <FormCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            selected={false} // No selection needed here
            onClick={card.onClick || (() => { })} // Handle click if needed
            iconSize={100}
            infoSize={25}
          />
        ))}
      </div>
    </div>
  );
}

export default Step5Content;
