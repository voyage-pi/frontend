import React, { useState } from 'react';
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaRoad } from "react-icons/fa6";
import { PiMapPinAreaFill } from "react-icons/pi";
import FormCard from './FormCard.jsx';

const Step2Content = () => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (card) => {
    setSelectedCard(card);
    localStorage.setItem("Trip Type", card)
  };

  const cardData = [
    {
      id: 'place',
      icon: FaMapMarkerAlt,
      title: 'Visit Place',
      iconInBox: true,  
    },
    {
      id: 'road',
      icon: FaRoad,
      title: 'Road Trip',
      iconInBox: true,  
    },
    {
      id: 'zone',
      icon: PiMapPinAreaFill,
      title: 'Zone Trip',
      iconInBox: true,
    },
  ];

  return (
    <div className="text-center p-6 -mb-10">
      <h2 className="text-3xl mb-10">What are you feeling?</h2>
      <div className="flex justify-center space-x-10">
        {cardData.map((card) => (
          <FormCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            selected={selectedCard === card.id}
            onClick={() => handleCardClick(card.id)}
            infoSize={20}
            iconSize={32}
            iconInBox={card.iconInBox}  
          />
        ))}
      </div>
    </div>
  );
};

export default Step2Content;
