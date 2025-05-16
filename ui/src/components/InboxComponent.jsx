import React, { useEffect, useCallback, useMemo } from 'react';
import { FaTimes, FaCheck, FaTimes as FaTimesIcon, FaBell, FaUsers, FaPlane, FaSync } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationsContext';
import { useAuth } from '../context/AuthContext';
import { axiosUser } from '../utils/axiosInstance';

const InboxComponent = ({ onClose, setNotification, currentUserId }) => {
  // Get auth context directly to ensure proper user ID
  const auth = useAuth();
  const userId = useMemo(() => auth?.LoggedUser?.id || currentUserId, [auth?.LoggedUser?.id, currentUserId]);
  
  const { 
    notifications, 
    removeFriendRequest, 
    removeTripInvite,
    friendRequestCount,
    tripInviteCount,
    refreshNotifications,
    isRefreshing
  } = useNotifications();
  
  // Debug log to check user information
  useEffect(() => {
    console.log("[InboxComponent] Auth context:", auth);
    console.log("[InboxComponent] Using user ID:", userId);
  }, [auth, userId]);
  
  // Fetch requests once when the component opens with a proper dependency array
  useEffect(() => {
    const fetchRequests = async () => {
      console.log("[InboxComponent] Component mounted, attempting to fetch notifications");
      
      try {
        // We call refreshNotifications even if userId is not yet available,
        // because authentication may work via cookies
        const success = await refreshNotifications();
        console.log(`[InboxComponent] Initial notification refresh ${success ? 'succeeded' : 'failed'}`);
        
        if (!success && userId) {
          // We have a userId but the refresh failed, try again after a delay
          setTimeout(() => {
            console.log("[InboxComponent] Retrying notification refresh...");
            refreshNotifications();
          }, 1500);
        }
      } catch (error) {
        console.error("[InboxComponent] Error fetching friend requests:", error);
      }
    };
    
    fetchRequests();
  }, [refreshNotifications]); // userId removed from deps to prevent multiple fetches
  
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      console.log("[InboxComponent] Already refreshing, ignoring refresh request");
      return;
    }
    
    try {
      console.log("[InboxComponent] Manually refreshing notifications");
      const success = await refreshNotifications();
      
      if (success) {
        setNotification({
          type: 'info',
          message: 'Notifications refreshed'
        });
      } else {
        setNotification({
          type: 'warning',
          message: 'Could not refresh notifications'
        });
      }
    } catch (error) {
      console.error("[InboxComponent] Error refreshing notifications:", error);
      setNotification({
        type: 'error',
        message: 'Failed to refresh notifications'
      });
    }
  }, [isRefreshing, refreshNotifications, setNotification]);
  
  const handleAcceptFriendRequest = useCallback(async (requestId, name) => {
    if (!userId) {
      setNotification({
        type: 'error',
        message: 'You need to be logged in to accept friend requests',
      });
      return;
    }

    console.log(`Accepting friend request from user ${requestId} to user ${userId}`);
    
    // Safety check - make sure we have valid IDs
    if (!requestId) {
      console.error(`Missing required ID for friend request: requestId=${requestId}`);
      setNotification({
        type: 'error',
        message: 'Invalid request data',
      });
      return;
    }
    
    // Validate that we're not trying to accept a request from ourselves
    if (requestId === userId) {
      console.log(`Error: Cannot accept a friend request from yourself (${requestId} = ${userId})`);
      setNotification({
        type: 'error',
        message: 'Cannot accept a friend request from yourself',
      });
      return;
    }
    
    try {
      console.log(`Making API call to accept friend request from user_id=${requestId}`);
      
      const response = await axiosUser.post('/friends/accept', {
        friend_id: parseInt(requestId)  // Now we only need to provide the friend_id (sender)
      });
      
      console.log("API response:", response);
      
      if (response.data) {
        // Remove from UI immediately
        removeFriendRequest(requestId);
        setNotification({
          type: 'success',
          message: `You are now friends with ${name}!`,
        });
        
        // Wait a moment for the DB update to complete, then refresh notifications
        setTimeout(async () => {
          console.log("Refreshing notifications after accepting friend request");
          await refreshNotifications();
        }, 1000);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || `Failed to accept friend request from ${name}. Please try again.`,
      });
    }
  }, [userId, removeFriendRequest, setNotification, refreshNotifications]);
  
  const handleRejectFriendRequest = useCallback(async (requestId, name) => {
    if (!userId) {
      setNotification({
        type: 'error',
        message: 'You need to be logged in to reject friend requests',
      });
      return;
    }

    try {
      console.log(`Rejecting friend request from user ${requestId}`);
      
      // API call to reject friend request
      const response = await axiosUser.delete('/friends/requests', {
        data: {
          friend_id: requestId // Now we only need to provide the friend_id (sender)
        }
      });
      
      if (response.status === 200 || response.status === 204) {
        // Remove from UI immediately
        removeFriendRequest(requestId);
        setNotification({
          type: 'info',
          message: `Friend request from ${name} declined`,
        });
        
        // Refresh notifications after rejecting to ensure UI is up to date
        await refreshNotifications();
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      setNotification({
        type: 'error',
        message: `Failed to decline friend request from ${name}. Please try again.`,
      });
    }
  }, [userId, removeFriendRequest, setNotification, refreshNotifications]);
  
  const handleAcceptTripInvite = useCallback((inviteId, tripName) => {
    removeTripInvite(inviteId);
    setNotification({
      type: 'success',
      message: `You joined trip "${tripName}"!`,
    });
  }, [removeTripInvite, setNotification]);
  
  const handleRejectTripInvite = useCallback((inviteId, tripName) => {
    removeTripInvite(inviteId);
    setNotification({
      type: 'info',
      message: `Trip invitation to "${tripName}" declined`,
    });
  }, [removeTripInvite, setNotification]);

  return (
    <div className="flex flex-col h-full">
      <div className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
        <div className="flex items-center mb-3 mt-3">
          <FaBell className="text-primary text-xl mr-3" />
          <h2 className="font-bold text-lg">Notifications</h2>
        </div>
        <div className="flex items-center">
          <button 
            className={`text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 mr-2 ${isRefreshing ? 'animate-spin text-primary' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh notifications"
          >
            <FaSync />
          </button>
          <button 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {isRefreshing && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Friend Requests Section */}
        {!isRefreshing && friendRequestCount > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <FaUsers className="text-primary text-sm mr-2" />
              <h3 className="font-medium text-md">Friend Requests</h3>
            </div>
            <div className="space-y-4">
              {notifications.friendRequests.map((request, index) => {
                // Ensure we have a valid ID for the request
                const requestSenderId = request.user_id || request.id;
                console.log(`Rendering friend request ${index}: id=${requestSenderId}, name=${request.name}`);
                
                return (
                  <div key={request.requestId || `${requestSenderId}_${index}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={request.image} 
                        alt={request.name} 
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                      <div>
                        <h3 className="font-medium">{request.name}</h3>
                        <p className="text-gray-500 text-xs">{request.username}</p>
                        <p className="text-gray-400 text-xs mt-1">Sent {request.date}</p>
                        <p className="text-gray-400 text-xs">ID: {requestSenderId}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <button 
                        onClick={() => handleAcceptFriendRequest(requestSenderId, request.name)}
                        className="p-2 bg-primary text-white rounded-full mr-2 hover:bg-primary-dark"
                      >
                        <FaCheck />
                      </button>
                      <button 
                        onClick={() => handleRejectFriendRequest(requestSenderId, request.name)}
                        className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
                      >
                        <FaTimesIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Trip Invites Section */}
        {!isRefreshing && tripInviteCount > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <FaPlane className="text-primary text-sm mr-2" />
              <h3 className="font-medium text-md">Trip Invitations</h3>
            </div>
            <div className="space-y-4">
              {notifications.tripInvites.map(invite => (
                <div key={invite.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <FaPlane className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{invite.tripName}</h3>
                      <p className="text-gray-500 text-xs">From: {invite.from}</p>
                      <p className="text-gray-400 text-xs mt-1">Sent {invite.date}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <button 
                      onClick={() => handleAcceptTripInvite(invite.id, invite.tripName)}
                      className="p-2 bg-primary text-white rounded-full mr-2 hover:bg-primary-dark"
                    >
                      <FaCheck />
                    </button>
                    <button 
                      onClick={() => handleRejectTripInvite(invite.id, invite.tripName)}
                      className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
                    >
                      <FaTimesIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!isRefreshing && friendRequestCount === 0 && tripInviteCount === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium text-gray-700 mb-1">No notifications</h3>
            <p className="text-sm text-gray-500 mb-4">You don't have any notifications at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(InboxComponent);