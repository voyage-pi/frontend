import React, { createContext, useState, useContext, useEffect } from 'react';


const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    friendRequests: [],
    tripInvites: []
  });

  const addFriendRequest = (request) => {
    setNotifications(prev => ({
      ...prev,
      friendRequests: [...prev.friendRequests, request]
    }));
  };

  const removeFriendRequest = (requestId) => {
    setNotifications(prev => ({
      ...prev,
      friendRequests: prev.friendRequests.filter(request => request.id !== requestId)
    }));
  };

  const addTripInvite = (invite) => {
    setNotifications(prev => ({
      ...prev,
      tripInvites: [...prev.tripInvites, invite]
    }));
  };

  const removeTripInvite = (inviteId) => {
    setNotifications(prev => ({
      ...prev,
      tripInvites: prev.tripInvites.filter(invite => invite.id !== inviteId)
    }));
  };

  const clearAllNotifications = () => {
    setNotifications({
      friendRequests: [],
      tripInvites: []
    });
  };

  return (
    <NotificationsContext.Provider value={{ 
      notifications,
      addFriendRequest, 
      removeFriendRequest, 
      addTripInvite,
      removeTripInvite,
      clearAllNotifications,
      totalCount: notifications.friendRequests.length + notifications.tripInvites.length,
      friendRequestCount: notifications.friendRequests.length,
      tripInviteCount: notifications.tripInvites.length
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider; 