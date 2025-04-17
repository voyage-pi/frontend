import React, { useState, useEffect } from 'react';
import { FaUserGroup, FaUser } from "react-icons/fa6";
import FormCard from './FormCard';
import FriendsInviteComponent from './FriendsInvite';

const Step1Content = ({ setCurrentStep, setShowLeaveButton }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [showFriendsInvite, setShowFriendsInvite] = useState(false);

  useEffect(() => {
    const savedSelection = localStorage.getItem("Trip Dimension");
    if (savedSelection) {
      setSelectedCard(savedSelection);
      if (savedSelection === 'group') {
        setShowFriendsInvite(true);
        setShowLeaveButton(false);
      } else {
        setShowLeaveButton(true);
      }
    } else {
      setShowLeaveButton(true);
    }
  }, [setShowLeaveButton]);

  const handleCardClick = (card) => {
    if (lastNotificationId === card.id) {
      return;
    }

    setSelectedCard(card.id); 
    localStorage.setItem("Trip Dimension", card.id);
  
    if (card.id === 'group') {
      setShowFriendsInvite(true);
      setShowLeaveButton(false);
    } else {
      setShowLeaveButton(true);
      setTimeout(() => {
        setCurrentStep(2);
      }, 300);
    }
  };
  
  const handleFriendsInviteNext = () => {
    setCurrentStep(2);
    setShowLeaveButton(true);
  };
  
  const handleFriendsInviteBack = () => {
    setShowFriendsInvite(false);
    setSelectedCard(null);
    localStorage.removeItem("Trip Dimension");
    setShowLeaveButton(true);
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
      implemented: true,
    },
  ];

  if (showFriendsInvite) {
    return <FriendsInviteComponent onNext={handleFriendsInviteNext} onBack={handleFriendsInviteBack} />;
  }

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
    </div>
  );
};

export default Step1Content;