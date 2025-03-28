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
    },
    {
      id: 'group',
      icon: FaUserGroup,
      title: 'Group Trip',
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
          />
        ))}
      </div>
    </div>
  );
};

export default Step1Content;
