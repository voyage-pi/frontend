import React, { createContext, useState, useContext } from 'react';

const FriendRequestContext = createContext();

export const useFriendRequests = () => useContext(FriendRequestContext);

export const FriendRequestProvider = ({ children }) => {
  const [pendingRequests, setPendingRequests] = useState([]);

  const addRequest = (request) => {
    setPendingRequests(prev => [...prev, request]);
  };

  const removeRequest = (requestId) => {
    setPendingRequests(prev => prev.filter(request => request.id !== requestId));
  };

  const clearRequests = () => {
    setPendingRequests([]);
  };

  return (
    <FriendRequestContext.Provider value={{ 
      pendingRequests, 
      addRequest, 
      removeRequest, 
      clearRequests, 
      requestCount: pendingRequests.length 
    }}>
      {children}
    </FriendRequestContext.Provider>
  );
};

export default FriendRequestProvider; 