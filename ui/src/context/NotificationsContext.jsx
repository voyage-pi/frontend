import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { axiosUser } from '../utils/axiosInstance';

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
      console.log("[NotificationsContext] Auth state changed:", auth?.LoggedUser?.id ? "User logged in" : "No user or loading");
      
      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      if (auth?.LoggedUser?.id && !initialDataLoaded.current) {
        // User is definitely logged in, fetch immediately
        console.log("[NotificationsContext] User logged in, fetching notifications");
        const success = await refreshNotifications();
        if (success) {
          initialDataLoaded.current = true;
          retryCountRef.current = 0;
        }
      } else if (auth?.isAuthenticated === true && !initialDataLoaded.current) {
        // Auth says we're authenticated but LoggedUser isn't loaded yet
        console.log("[NotificationsContext] Auth says we're authenticated but LoggedUser isn't loaded yet");
        refreshNotifications();
      } else if (!initialDataLoaded.current && retryCountRef.current < 3) {
        // Not loaded and under retry limit, schedule retry
        retryCountRef.current++;
        console.log(`[NotificationsContext] Scheduling retry attempt ${retryCountRef.current}/3`);
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
      console.log("[NotificationsContext] Friend requests fetch already in progress, skipping");
      return true;
    }
    
    try {
      // Set fetching flag to prevent duplicate calls
      isFetchingRef.current = true;
      
      console.log("[NotificationsContext] Fetching friend requests - API call starts");
      const response = await axiosUser.get('/friends/requests/received/users/');
      console.log("[NotificationsContext] Response from fetchFriendRequests:", response.data);
      
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
            console.log("friend_id:", request.friend_id);
            console.log("user_id:", request.user_id);
            
            // Fetch user info for this friend request if needed
            let userData = null;
            if (request.user_id) {
              try {
                const userResponse = await axiosUser.get(`/user/${request.user_id}`);
                console.log("friend info:", userResponse.data);
                userData = userResponse.data;
              } catch (error) {
                console.error("Error fetching friend user info:", error);
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
            console.error("Error processing individual request:", error);
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
      console.error("Error fetching requests:", error);
      return false;
    } finally {
      isFetchingRef.current = false;
    }
  }, []);
  
  // Helper function to fetch trip invites
  const fetchTripInvites = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingTripInvitesRef.current) {
      console.log("[NotificationsContext] Trip invites fetch already in progress, skipping");
      return true;
    }
    
    try {
      // Set fetching flag to prevent duplicate calls
      isFetchingTripInvitesRef.current = true;
      
      console.log("[NotificationsContext] Fetching trip invites - API call starts");
      const response = await axiosUser.get('/trips/invitations');
      console.log("[NotificationsContext] Response from fetchTripInvites:", response.data);
      
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
            console.log("trip_id:", invite.trip_id);
            console.log("user_id:", invite.user_id);
            
            // Fetch trip info for this invite
            let tripData = null;
            if (invite.trip_id) {
              try {
                const tripResponse = await axiosUser.get(`/trips/${invite.trip_id}`);
                console.log("trip info:", tripResponse.data);
                tripData = tripResponse.data.response;
              } catch (error) {
                console.error("Error fetching trip info:", error);
              }
            }
            
            const tripInvite = {
              id: invite.trip_id,
              trip_id: invite.trip_id,
              tripName: tripData?.itinerary?.name || "Unnamed Trip",
              date: invite.joined_trip_at ? new Date(invite.joined_trip_at).toLocaleDateString() : "recently",
              inviteId: invite.id
            };
            
            // Use Map to ensure uniqueness by ID
            uniqueInvites.set(tripInvite.id, tripInvite);
          } catch (error) {
            console.error("Error processing individual invite:", error);
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
      console.error("Error fetching trip invites:", error);
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
      console.log("[NotificationsContext] Already refreshing, skipping");
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
      console.error("[NotificationsContext] Error refreshing notifications:", error);
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