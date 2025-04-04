import React, { useState, useEffect } from 'react';
import { FaUserGroup, FaUser } from "react-icons/fa6";
import FormCard from './FormCard';
import Notification from '../Notification';

const Step1Content = ({ setCurrentStep }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lastNotificationId, setLastNotificationId] = useState(null);

  useEffect(() => {
    const savedSelection = localStorage.getItem("Trip Dimension");
    if (savedSelection) {
      setSelectedCard(savedSelection);
    }
  }, []);

  const closeNotification = () => {
    setNotification(null);
    setLastNotificationId(null);
  };

  const handleCardClick = (card) => {
    if (lastNotificationId === card.id) {
      return;
    }

    if (card.id === selectedCard && card.implemented === false) {
      setNotification(
        <Notification
          type="warning"
          text="This feature is not yet implemented."
          onClose={closeNotification} 
        />
      );
      setLastNotificationId(card.id);
      return;
    }

    if (card.implemented === false) {
      setNotification(
        <Notification
          type="warning"
          text="This feature is not yet implemented."
          onClose={closeNotification} 
        />
      );
      setLastNotificationId(card.id);
      return;
    }

    setSelectedCard(card.id); 
    localStorage.setItem("Trip Dimension", card.id);
  
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  };
  
  const cardData = [
    {
      id: 'individual',
      icon: FaUser,
      title: 'Individual Trip',
      text: "Are you a solo traveler looking for a personal experience? This option allows you to customize your itinerary based on your specific preferences, schedule, and interests without needing to coordinate with others. Perfect for self-discovery, personal adventures, or business travelers seeking convenience.",
      implemented: true,
    },
    {
      id: 'group',
      icon: FaUserGroup,
      title: 'Group Trip',
      text: "Ideal for traveling with friends, family, or colleagues. You'll be able to customize your itinerary to accommodate everyone's interests and needs, creating a collaborative travel experience that strengthens bonds and creates lasting memories together.",
      implemented: false,
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
            onClick={() => handleCardClick(card)}
            text={card.text}
            id={card.id}
          />
        ))}
      </div>
      {notification && <div className="notification-container">{notification}</div>}
    </div>
  );
};

export default Step1Content;