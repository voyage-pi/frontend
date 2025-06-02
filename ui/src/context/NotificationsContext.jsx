import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { axiosUser, axiosInstance } from '../utils/axiosInstance';

// Create context with default values to avoid undefined errors
const NotificationsContext = createContext({
  notifications: { friendRequests: [], tripInvites: [] },
  friendRequestCount: 0,
  tripInviteCount: 0,
  totalCount: 0,
  isRefreshing: false,
  refreshNotifications: async () => false,
  addTripInvite: () => {},
  removeTripInvite: () => {},
  clearFriendRequests: () => {},
  removeFriendRequest: () => {},
  clearAllNotifications: () => {},
  updateLastFetchTime: () => {},
  getLastFetchTime: () => 0,
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    friendRequests: [],
    tripInvites: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const auth = useAuth();
  
  // Refs to track state
  const initialDataLoaded = useRef(false);
  const isFetchingRef = useRef(false);
  const isFetchingTripInvitesRef = useRef(false);
  const retryTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  
  // Handle auth changes - fetch initial data when user logs in
  useEffect(() => {
    const attemptInitialFetch = async () => {
       ;
      
      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      if (auth?.LoggedUser?.id && !initialDataLoaded.current) {
        // User is definitely logged in, fetch immediately
         ;
        const success = await refreshNotifications();
        if (success) {
          initialDataLoaded.current = true;
          retryCountRef.current = 0;
        }
      } else if (auth?.isAuthenticated === true && !initialDataLoaded.current) {
        // Auth says we're authenticated but LoggedUser isn't loaded yet
         ;
        refreshNotifications();
      } else if (!initialDataLoaded.current && retryCountRef.current < 3) {
        // Not loaded and under retry limit, schedule retry
        retryCountRef.current++;
         ;
        retryTimeoutRef.current = setTimeout(attemptInitialFetch, 2000); // Retry after 2 seconds
      }
    };
    
    attemptInitialFetch();
    
    // Cleanup retry timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [auth?.LoggedUser?.id, auth?.isAuthenticated]); 
  
  // Main function to fetch friend requests
  const fetchFriendRequests = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
       ;
      return true;
    }
    
    try {
      // Set fetching flag to prevent duplicate calls
      isFetchingRef.current = true;
      
       ;
      const response = await axiosUser.get('/friends/requests/received/users/');
       ;
      
      // Clear existing requests only if we got a successful response
      clearFriendRequests();
      
      // Messages with "No friend requests" are expected for empty results
      if (response.data && typeof response.data === 'object' && response.data.message) {
        initialDataLoaded.current = true;
        return true;
      }
      
      if (response.data && Array.isArray(response.data)) {
        const uniqueRequests = new Map();
        
        for (const request of response.data) {
          try {
            // Debug logging to see the request structure
             ;
             ;
            
            // Fetch user info for this friend request if needed
            let userData = null;
            if (request.user_id) {
              try {
                const userResponse = await axiosUser.get(`/user/${request.user_id}`);
                 ;
                userData = userResponse.data;
              } catch (error) {
                 ;
              }
            }
            
            const friendRequest = {
              id: request.user_id, // The ID of the user who sent the request
              user_id: request.user_id, // Store this explicitly for debugging
              name: userData?.name || request.user_name || "Unknown User",
              username: userData?.email || request.user_email || `@user_${request.user_id}`,
              image: userData?.avatar_url || request.user_avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
              date: request.created_at ? new Date(request.created_at).toLocaleDateString() : "recently",
              requestId: request.id
            };
            
            // Use Map to ensure uniqueness by ID
            uniqueRequests.set(friendRequest.id, friendRequest);
          } catch (error) {
             ;
          }
        }
        
        // Add all unique requests at once instead of individually
        setNotifications(prev => ({
          ...prev,
          friendRequests: [...Array.from(uniqueRequests.values())]
        }));
        
        initialDataLoaded.current = true;
        return true;
      } else {
        return false;
      }
    } catch (error) {
       ;
      return false;
    } finally {
      isFetchingRef.current = false;
    }
  }, []);
  
  // Helper function to fetch trip invites
  const fetchTripInvites = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingTripInvitesRef.current) {
       ;
      return true;
    }
    
    try {
      // Set fetching flag to prevent duplicate calls
      isFetchingTripInvitesRef.current = true;
      
       ;
      const response = await axiosUser.get('/trips/invitations');
       ;
      
      // Clear existing invites only if we got a successful response
      setNotifications(prev => ({ ...prev, tripInvites: [] }));
      
      // Messages with "No invitations found" are expected for empty results
      if (response.data && typeof response.data === 'object' && response.data.message) {
        initialDataLoaded.current = true;
        return true;
      }
      
      if (response.data && Array.isArray(response.data)) {
        const uniqueInvites = new Map();
        
        for (const invite of response.data) {
          try {
            // Debug logging to see the invite structure
             ;
             ;
            
            // Fetch trip info for this invite
            let tripData = null;
            if (invite.trip_id) {
              try {
                const tripResponse = await axiosInstance.get(`/trips/${invite.trip_id}`);
                 ;
                tripData = tripResponse.data.response;
              } catch (error) {
                 ;
              }
            }

            // Fetch trip participants and get tags for each
            let participants = [];
            try {
              const tripParticipants = await axiosUser.get(`/trips/participants/${invite.trip_id}`);
              // For each participant, fetch their tag
              participants = await Promise.all(
                tripParticipants.data.map(async (p) => {
                  try {
                    const userInfo = await axiosUser.get(`/user/${p.user_id}`);
                    return userInfo.data.tag || userInfo.data.name || `User ${p.user_id}`;
                  } catch (error) {
                    return `User ${p.user_id}`;
                  }
                })
              );
            } catch (error) {
               ;
            }

            const tripInvite = {
              id: invite.trip_id,
              trip_id: invite.trip_id,
              tripName: tripData?.itinerary?.name || "Unnamed Trip",
              participants,
              date: invite.joined_trip_at ? new Date(invite.joined_trip_at).toLocaleDateString() : "recently",
              inviteId: invite.id
            };
            
            // Use Map to ensure uniqueness by ID
            uniqueInvites.set(tripInvite.id, tripInvite);
          } catch (error) {
             ;
          }
        }
        
        // Add all unique invites at once instead of individually
        setNotifications(prev => ({
          ...prev,
          tripInvites: [...Array.from(uniqueInvites.values())]
        }));
        
        initialDataLoaded.current = true;
        return true;
      } else {
        return false;
      }
    } catch (error) {
       ;
      return false;
    } finally {
      isFetchingTripInvitesRef.current = false;
    }
  }, []);
  
  // Helper functions to manage notifications state
  const removeFriendRequest = useCallback((requestId) => {
    setNotifications(prev => ({ 
      ...prev, 
      friendRequests: prev.friendRequests.filter(request => request.id !== requestId) 
    }));
  }, []);
  
  const clearFriendRequests = useCallback(() => {
    setNotifications(prev => ({ 
      ...prev, 
      friendRequests: [] 
    }));
  }, []);
  
  const updateLastFetchTime = useCallback(() => {
    lastFetchTimeRef.current = Date.now();
  }, []);
  
  const getLastFetchTime = useCallback(() => lastFetchTimeRef.current, []);
  
  const addTripInvite = useCallback((invite) => {
    setNotifications(prev => {
      // Check if we already have this invite
      const existingInvite = prev.tripInvites.find(i => i.id === invite.id);
      if (existingInvite) {
        return prev;
      }
      return {
        ...prev,
        tripInvites: [...prev.tripInvites, invite]
      };
    });
  }, []);
  
  const removeTripInvite = useCallback((inviteId) => {
    setNotifications(prev => ({ 
      ...prev, 
      tripInvites: prev.tripInvites.filter(invite => invite.id !== inviteId) 
    }));
  }, []);
  
  const clearAllNotifications = useCallback(() => {
    setNotifications({ 
      friendRequests: [], 
      tripInvites: [] 
    });
  }, []);

  // Create a proper wrapper for fetching all notifications
  const refreshNotifications = useCallback(async () => {
    // If already refreshing, don't start another refresh
    if (isRefreshing) {
       ;
      return true;
    }
    
    // We proceed even if LoggedUser isn't loaded yet, because the authentication cookie
    // might still be valid (which is what the server actually checks)
    console.log("[NotificationsContext] Refreshing notifications, auth state:", 
      auth?.isAuthenticated ? "authenticated" : "not authenticated",
      auth?.LoggedUser?.id ? `user ID: ${auth.LoggedUser.id}` : "no user ID");
    
    setIsRefreshing(true);
    try {
      const friendsResult = await fetchFriendRequests();
      const invitesResult = await fetchTripInvites();
      return friendsResult && invitesResult;
    } catch (error) {
       ;
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFriendRequests, fetchTripInvites, isRefreshing, auth?.isAuthenticated, auth?.LoggedUser?.id]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    notifications, 
    removeFriendRequest, 
    clearFriendRequests,
    updateLastFetchTime,
    getLastFetchTime, 
    addTripInvite,
    removeTripInvite,
    clearAllNotifications,
    isRefreshing,
    totalCount: notifications.friendRequests.length + notifications.tripInvites.length,
    friendRequestCount: notifications.friendRequests.length,
    tripInviteCount: notifications.tripInvites.length,
    refreshNotifications
  }), [
    notifications, 
    removeFriendRequest, 
    clearFriendRequests,
    updateLastFetchTime,
    getLastFetchTime, 
    addTripInvite,
    removeTripInvite,
    clearAllNotifications,
    isRefreshing,
    refreshNotifications
  ]);

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider; 