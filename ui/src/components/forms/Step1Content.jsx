import React, { useState, useEffect } from 'react';
import { FaUserGroup, FaUser } from "react-icons/fa6";
import FormCard from './FormCard';
import FriendsInviteComponent from './FriendsInvite';
import { useAuth } from '../../context/AuthContext';
import Notification from '../Notification';

const Step1Content = ({ setDisableButton,setCurrentStep, setShowLeaveButton, setIsGroup, addedUsers, setAddedUsers }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [showFriendsInvite, setShowFriendsInvite] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const savedSelection = localStorage.getItem("Trip Dimension");
    if (savedSelection) {
      setSelectedCard(savedSelection);
      if (savedSelection === 'group') {
        setShowFriendsInvite(true);
        setShowLeaveButton(false);
        setIsGroup(true);
      } else {
        setShowLeaveButton(true);
        setIsGroup(false);
      }
    } else {
      // Check if there are pre-added users from localStorage
      const savedAddedUsers = localStorage.getItem("addedUsers");
      if (savedAddedUsers) {
        try {
          const parsedUsers = JSON.parse(savedAddedUsers);
          if (parsedUsers.length > 0) {
            // Auto-select group trip and show friends invite
            setSelectedCard('group');
            localStorage.setItem("Trip Dimension", 'group');
            setShowFriendsInvite(true);
            setShowLeaveButton(false);
            setIsGroup(true);
          } else {
            setShowLeaveButton(true);
          }
        } catch (error) {
          console.error("Error parsing saved addedUsers:", error);
          setShowLeaveButton(true);
        }
      } else {
        setShowLeaveButton(true);
      }
    }
  }, [setShowLeaveButton, setIsGroup]);

  const handleCardClick = (card) => {
    if (lastNotificationId === card.id) {
      return;
    }

    if (card.id === 'group' && !isAuthenticated) {
      setShowNotification(true);
      return;
    }

    setSelectedCard(card.id); 
    localStorage.setItem("Trip Dimension", card.id);
  
    if (card.id === 'group') {
      setShowFriendsInvite(true);
      setShowLeaveButton(false);
      setIsGroup(true);
      console.log("Selected group trip, setIsGroup(true)");
    } else {
      setShowLeaveButton(true);
      setIsGroup(false);
      setTimeout(() => {
        setCurrentStep(2);
      }, 300);
      console.log("Selected individual trip, setIsGroup(false)");
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
    setIsGroup(false);
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
    return <FriendsInviteComponent setDisableButton={setDisableButton} onNext={handleFriendsInviteNext} onBack={handleFriendsInviteBack} addedUsers={addedUsers} setAddedUsers={setAddedUsers} />;
  }

  return (
    <div className="text-center p-6 -mb-10">
      {showNotification && (
        <Notification
          type="error"
          text="You need to be logged in to create a group trip"
          onClose={() => setShowNotification(false)}
        />
      )}
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