import React, { useState } from 'react';
import { FaUserGroup, FaUser } from "react-icons/fa6";
import FormCard from './FormCard';

const Step1Content = () => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (card) => {
    setSelectedCard(card);
    localStorage.setItem("Trip Dimension", card)
  };

  const cardData = [
    {
      id: 'individual',
      icon: FaUser,
      title: 'Individual Trip',
      text: "Are you a solo traveler looking for a personal experiences? This option allows you to customize your itinerary based on your specific preferences, schedule, and interests without needing to coordinate with others. Perfect for self-discovery, personal adventures, or business travelers seeking convenience.",
    },
    {
      id: 'group',
      icon: FaUserGroup,
      title: 'Group Trip',
      text: "Ideal for traveling with friends, family, or colleagues. You'll be able to customize your itinerary to accommodate everyone's interests and needs, creating a collaborative travel experience that strengthens bonds and creates lasting memories together.",
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
            selected={selectedCard === card.id}
            onClick={() => handleCardClick(card.id)}
            text={card.text}
            id={card.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Step1Content;