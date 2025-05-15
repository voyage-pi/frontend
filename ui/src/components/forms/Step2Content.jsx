import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaRoad } from "react-icons/fa6";
import { PiMapPinAreaFill } from "react-icons/pi";
import FormCard from './FormCard.jsx';
import Notification from '../Notification';

const Step2Content = ({ setCurrentStep }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lastNotificationId, setLastNotificationId] = useState(null);

  useEffect(() => {
    const savedSelection = localStorage.getItem("Trip Type");
    if (savedSelection) {
      setSelectedCard(savedSelection);
    }
  }, []);

  const closeNotification = () => {
    setNotification(null);
    setLastNotificationId(null);
  };

  const handleCardClick = (cardId) => {
    const card = cardData.find(c => c.id === cardId);

    if (lastNotificationId === cardId) {
      return;
    }

    if (card.implemented === false) {
      setNotification(
        <Notification
          type="info"
          text="Road Trip is coming soon!"
          onClose={closeNotification}
        />
      );
      setLastNotificationId(cardId);
      return;
    }

    setSelectedCard(cardId);
    localStorage.setItem("Trip Type", cardId);

    setTimeout(() => {
      setCurrentStep(3);
    }, 300);
  };

  const cardData = [
    {
      id: 'place',
      icon: FaMapMarkerAlt,
      title: 'Visit Place',
      iconInBox: true,
      text: "Perfect when you want to explore a specific city or destination. Ideal for travelers who want to immerse themselves in one destination, whether it's a weekend city break or a longer stay to truly get to know a place.",
      implemented: true,
    },
    {
      id: 'road',
      icon: FaRoad,
      title: 'Road Trip',
      iconInBox: true,
      text: "An adventure that takes you from one destination to another, with the journey being just as important as the destinations. Perfect for travelers who enjoy the freedom of the open road and the excitement of unexpected discoveries along your route.",
      implemented: true,
    },
    {
      id: 'zone',
      icon: PiMapPinAreaFill,
      title: 'Zone Trip',
      iconInBox: true,
      text: "Ideal for exploring everything within a specific radius of your current location. Simply set your current position and specify how far you're willing to travel, and discover all the attractions and experiences available nearby. Great for making the most of unexpected free time or exploring your immediate surroundings.",
      implemented: true,
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
            text={card.text}
            id={card.id}
          />
        ))}
      </div>
      {notification && <div className="notification-container">{notification}</div>}
    </div>
  );
};

export default Step2Content;
