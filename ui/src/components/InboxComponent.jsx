import React from 'react';
import { FaTimes, FaCheck, FaTimes as FaTimesIcon, FaBell, FaUsers, FaPlane } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationsContext';

const InboxComponent = ({ onClose, setNotification }) => {
  const { 
    notifications, 
    removeFriendRequest, 
    removeTripInvite,
    friendRequestCount,
    tripInviteCount 
  } = useNotifications();
  
  const handleAcceptFriendRequest = (requestId, name) => {
    // API call to accept friend request would go here
    removeFriendRequest(requestId);
    setNotification({
      type: 'success',
      text: `You are now friends with ${name}!`,
      key: Date.now()
    });
  };
  
  const handleRejectFriendRequest = (requestId, name) => {
    // API call to reject friend request would go here
    removeFriendRequest(requestId);
    setNotification({
      type: 'info',
      text: `Friend request from ${name} declined`,
      key: Date.now()
    });
  };
  
  const handleAcceptTripInvite = (inviteId, tripName) => {
    // API call to accept trip invite would go here
    removeTripInvite(inviteId);
    setNotification({
      type: 'success',
      text: `You joined trip "${tripName}"!`,
      key: Date.now()
    });
  };
  
  const handleRejectTripInvite = (inviteId, tripName) => {
    // API call to reject trip invite would go here
    removeTripInvite(inviteId);
    setNotification({
      type: 'info',
      text: `Trip invitation to "${tripName}" declined`,
      key: Date.now()
    });
  };

  return (
    <div className="pt-3 w-full md:w-2/5 lg:w-1/3 bg-white border-l border-gray-200 flex flex-col h-screen overflow-hidden">
      <div className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
        <div className="flex items-center mb-3">
          <FaBell className="text-primary text-xl mr-3" />
          <h2 className="font-bold text-lg">Notifications</h2>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {/* Friend Requests Section */}
        {friendRequestCount > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <FaUsers className="text-primary text-sm mr-2" />
              <h3 className="font-medium text-md">Friend Requests</h3>
            </div>
            <div className="space-y-4">
              {notifications.friendRequests.map(request => (
                <div key={request.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
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
                    </div>
                  </div>
                  <div className="flex">
                    <button 
                      onClick={() => handleAcceptFriendRequest(request.id, request.name)}
                      className="p-2 bg-primary text-white rounded-full mr-2 hover:bg-primary-dark"
                    >
                      <FaCheck />
                    </button>
                    <button 
                      onClick={() => handleRejectFriendRequest(request.id, request.name)}
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
        
        {/* Trip Invites Section */}
        {tripInviteCount > 0 && (
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
        {friendRequestCount === 0 && tripInviteCount === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium text-gray-700 mb-1">No notifications</h3>
            <p className="text-sm text-gray-500 mb-4">You don't have any notifications at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxComponent; 