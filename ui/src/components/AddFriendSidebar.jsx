import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FaUserPlus, FaTimes, FaCheck, FaClock } from "react-icons/fa";
import { axiosUser } from "../utils/axiosInstance";

function AddFriendSidebar({
  onClose,
  friendEmail,
  setFriendEmail,
  selectedUserToAdd,
  setSelectedUserToAdd,
  searchResults,
  setSearchResults,
  isSearching,
  inviteSent,
  sentToEmail,
  handleSendInvite,
  sentInvitations,
  handleUserSelect
}) {
  // State to store user info for each sent invitation
  const [sentUsersInfo, setSentUsersInfo] = useState({});
  const [loadingSentUsers, setLoadingSentUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!sentInvitations || sentInvitations.length === 0) {
        setSentUsersInfo({});
        return;
      }
      setLoadingSentUsers(true);
      const info = {};
      await Promise.all(sentInvitations.map(async (inv) => {
        // Try to get user_id from invitation (id or friend_id)
        const userId = inv.id || inv.friend_id;
        if (!userId) return;
        try {
          const res = await axiosUser.get(`/user/${userId}`);
          if (res.data) {
            info[userId] = res.data;
          }
        } catch (e) {
          // fallback: just use invitation info
          info[userId] = null;
        }
      }));
      setSentUsersInfo(info);
      setLoadingSentUsers(false);
    };
    fetchUsers();
  }, [sentInvitations]);

  return (
    <div className="flex flex-col h-full">
      <div className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
        <div className="flex items-center mb-3">
          <FaUserPlus className="text-primary text-xl mr-3" />
          <h2 className="font-bold text-lg">Add Friend</h2>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          onClick={() => {
            onClose();
            setSearchResults([]);
            setSelectedUserToAdd(null);
          }}
        >
          <FaTimes />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {/* Success Message */}
        {inviteSent && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <FaCheck className="text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-700">Invitation Sent!</h3>
              <p className="text-green-600 text-sm">We've sent a friend request to {sentToEmail}.</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4">
          <h3 className="font-medium text-lg mb-4">Send Friend Invitation</h3>

          {/* Selected user summary */}
          {selectedUserToAdd ? (
            <div className="flex items-center mb-4 p-2 bg-gray-100 rounded">
              <span className="font-medium mr-2">{selectedUserToAdd.name}</span>
              <span className="text-gray-500 text-xs mr-2">@{selectedUserToAdd.tag}</span>
              <button onClick={() => setSelectedUserToAdd(null)} className="ml-2 text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Name or Tag
              </label>
              <input
                type="text"
                value={friendEmail}
                onChange={e => {
                  setFriendEmail(e.target.value);
                  setSelectedUserToAdd(null);
                }}
                placeholder="Enter name or tag"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}

          {/* Search Results */}
          {!selectedUserToAdd && (isSearching ? (
            <div className="py-3 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : (
            friendEmail.length >= 2 && (
              searchResults.length > 0 ? (
                <div className="max-h-56 overflow-y-auto mb-4 border border-gray-100 rounded-md">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer ${selectedUserToAdd?.id === user.id ? 'bg-primary-50 border-l-4 border-primary' : 'border-b border-gray-100'}`}
                      onClick={() => {
                        setSelectedUserToAdd(user);
                        setFriendEmail("");
                      }}
                    >
                      <div className="flex items-center">
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.tag}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center border border-gray-100 rounded-md mb-4">
                  <p className="text-gray-500">No users found. Try a different search term.</p>
                </div>
              )
            )
          ))}

          <button
            onClick={handleSendInvite}
            className={`w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors ${!selectedUserToAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!selectedUserToAdd}
          >
            Send Invitation
          </button>
        </div>

        {/* Sent Invitations Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4">
          <h3 className="font-medium text-lg mb-4">Sent Invitations</h3>

          {loadingSentUsers ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="text-gray-500 mt-2">Loading invitations...</p>
            </div>
          ) : sentInvitations.length > 0 ? (
            <div className="space-y-3">
              {sentInvitations.map(invitation => {
                const userId = invitation.id || invitation.friend_id;
                const user = sentUsersInfo[userId];
                return (
                  <div key={invitation.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-md">
                    <div className="flex items-center">
                      {user && user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-gray-500 font-medium">{(user && user.name ? user.name.charAt(0) : invitation.name.charAt(0)).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user && user.name ? user.name : invitation.name}</p>
                        <p className="text-gray-500 text-xs">@{user && user.tag ? user.tag : invitation.tag}</p>
                        <div className="flex items-center">
                          <FaClock className="text-gray-400 text-xs mr-1" />
                          <p className="text-gray-500 text-xs">Sent recently</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Pending</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending invitations sent</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

AddFriendSidebar.propTypes = {
  onClose: PropTypes.func.isRequired,
  friendEmail: PropTypes.string.isRequired,
  setFriendEmail: PropTypes.func.isRequired,
  selectedUserToAdd: PropTypes.object,
  setSelectedUserToAdd: PropTypes.func.isRequired,
  searchResults: PropTypes.array.isRequired,
  setSearchResults: PropTypes.func.isRequired,
  isSearching: PropTypes.bool.isRequired,
  inviteSent: PropTypes.bool.isRequired,
  sentToEmail: PropTypes.string.isRequired,
  handleSendInvite: PropTypes.func.isRequired,
  sentInvitations: PropTypes.array.isRequired,
  handleUserSelect: PropTypes.func.isRequired
};

export default AddFriendSidebar; 