import React, { useState, useEffect } from "react";
import PageTemplate from "../components/PageTemplate";
import SearchBar from "../components/SearchBar";
import TripCard from "../components/TripCard";
import FriendCard from "../components/FriendCard";
import { FaTimes, FaUserFriends, FaEnvelope, FaUserPlus, FaCheck, FaTimes as FaTimesIcon, FaBell } from "react-icons/fa";
import friendsData from "../../public/friends.json";
import { useFriendRequests } from "../context/FriendRequestContext";


function Friends() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeTab, setActiveTab] = useState("with_you");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  
  // Get friend request state from context
  const { pendingRequests, addRequest, removeRequest, requestCount } = useFriendRequests();
  
  // Initial sample data loading 
  useEffect(() => {
    // Only load sample data if no requests exist yet
    if (pendingRequests.length === 0) {
      const sampleInvites = [
        {
          id: 101,
          name: "Emma Thompson",
          username: "@emma_travels",
          image: "https://randomuser.me/api/portraits/women/44.jpg",
          date: "2 days ago"
        },
        {
          id: 102,
          name: "Marcus Kim",
          username: "@world_explorer",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          date: "5 days ago"
        }
      ];
      
      sampleInvites.forEach(invite => addRequest(invite));
    }
  }, []);

  // Auto-hide the invitation success message after 5 seconds
  useEffect(() => {
    let timer;
    if (inviteSent) {
      timer = setTimeout(() => {
        setInviteSent(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [inviteSent]);

  const filteredFriends = friendsData.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setShowInvites(false);
    setShowAddFriend(false);
  };

  const handleCreateNew = () => {
    setShowAddFriend(true);
    setSelectedFriend(null);
    setShowInvites(false);
    setInviteSent(false);
  };
  
  const handleShowInvites = () => {
    setShowInvites(true);
    setSelectedFriend(null);
    setShowAddFriend(false);
  };
  
  const handleSendInvite = () => {
    if (!friendEmail.trim()) return;
    
    // In a real app, this would be an API call
    setSentToEmail(friendEmail);
    setInviteSent(true);
    setFriendEmail("");
  };
  
  const handleAcceptInvite = (inviteId) => {
    // api call to accept invite
    removeRequest(inviteId);
    alert("Friend request accepted!");
  };
  
  const handleRejectInvite = (inviteId) => {
    // api call to reject invite
    removeRequest(inviteId);
    alert("Friend request declined");
  };

  return (
    <PageTemplate>
      <div className="h-full flex flex-col">
        <div className="flex flex-1 h-full">
          <div className={`flex-1 flex flex-col ${selectedFriend || showInvites || showAddFriend ? 'hidden md:flex' : ''}`}>
            <div className="bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-10 mt-3">
              <div className="flex items-center">
                <FaUserFriends className="text-primary text-xl mr-3" />
                <h1 className="text-2xl font-bold">Friends</h1>
              </div>
              <div className="flex items-center">
                <button 
                  className="p-2 px-4 relative bg-gray-100 rounded-full hover:bg-gray-200 flex items-center"
                  onClick={handleShowInvites}
                >
                  <FaEnvelope className="text-gray-600 mr-2" />
                  <span className="text-gray-600 font-medium">Inbox</span>
                  {requestCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {requestCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              <div className="mb-6">
                <SearchBar 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onCreateNew={handleCreateNew}
                  createButtonText="Add Friend"
                  placeholder="Search for friends"
                />
              </div>

              {filterOpen && (
                <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-medium mb-2">Filters</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm cursor-pointer hover:bg-gray-100">Most recent</div>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm cursor-pointer hover:bg-gray-100">Most trips</div>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm cursor-pointer hover:bg-gray-100">Nearby</div>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm cursor-pointer hover:bg-gray-100">Suggested</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-2">
                {filteredFriends.map(friend => (
                  <div key={friend.id} className="transform-gpu">
                    <FriendCard 
                      friend={friend}
                      onClick={handleFriendClick}
                      selected={selectedFriend && selectedFriend.id === friend.id}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedFriend && (
            <div className="pt-3 w-full md:w-2/5 lg:w-1/3 bg-white border-l border-gray-200 flex flex-col h-screen overflow-hidden">
              <div className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
                <div className="flex items-center">
                  <img 
                    src={selectedFriend.image} 
                    alt={selectedFriend.name} 
                    className="w-15 h-15 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h2 className="font-bold text-lg">{selectedFriend.name}</h2>
                    <p className="text-gray-500 text-xs">{selectedFriend.username}</p>
                  </div>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setSelectedFriend(null)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="w-full h-48 relative">
                <img 
                  src={selectedFriend.coverImage || "https://images.unsplash.com/photo-1476067897447-d0c5df27b5df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"}
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <h2 className="text-white text-xl font-bold">{selectedFriend.name}</h2>
                  <p className="text-white/80 text-sm">{selectedFriend.bio || `Travel enthusiast with ${selectedFriend.countries || 0} countries visited`}</p>
                </div>
              </div>

              <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between">
                <div className="text-center flex flex-col items-center px-3">
                  <div className="font-bold text-lg">{selectedFriend.trips || 0}</div>
                  <div className="text-xs text-gray-500">Trips</div>
                </div>
                <div className="text-center flex flex-col items-center px-3">
                  <div className="font-bold text-lg">{selectedFriend.countries || 0}</div>
                  <div className="text-xs text-gray-500">Countries</div>
                </div>
                <div className="text-center flex flex-col items-center px-3">
                  <div className="font-bold text-lg">{selectedFriend.cities || 0}</div>
                  <div className="text-xs text-gray-500">Cities</div>
                </div>
                <div className="text-center flex flex-col items-center px-3">
                  <div className="font-bold text-lg">{selectedFriend.days || 0}</div>
                  <div className="text-xs text-gray-500">Days</div>
                </div>
              </div>

              <div className="border-b border-gray-100 bg-white">
                <div className="flex">
                  <button 
                    className={`py-3 px-4 flex-1 text-center font-medium ${activeTab === "with_you" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
                    onClick={() => setActiveTab("with_you")}
                  >
                    Trips Together
                  </button>
                  <button 
                    className={`py-3 px-4 flex-1 text-center font-medium ${activeTab === "all" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
                    onClick={() => setActiveTab("all")}
                  >
                    All Trips
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 bg-gray-50">
                {selectedFriend.trips_data && selectedFriend.trips_data.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFriend.trips_data.map(trip => (
                      <TripCard
                        key={trip.id}
                        image={trip.image}
                        days={trip.days}
                        people={trip.people}
                        destinations={trip.destinations}
                        name={trip.name}
                        date={trip.date}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                    <div className="text-gray-400 text-6xl mb-3">🌎</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No trips yet</h3>
                    <p className="text-sm text-gray-500 mb-4">You haven't traveled with {selectedFriend.name} yet</p>
                    <button className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-primary-dark transition-colors">
                      Plan a Trip Together
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Friend Requests Inbox */}
          {showInvites && (
            <div className="pt-3 w-full md:w-2/5 lg:w-1/3 bg-white border-l border-gray-200 flex flex-col h-screen overflow-hidden">
              <div className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
                <div className="flex items-center mb-3">
                  <FaBell className="text-primary text-xl mr-3" />
                  <h2 className="font-bold text-lg">Friend Requests</h2>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setShowInvites(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-4 bg-gray-50">
                {pendingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRequests.map(invite => (
                      <div key={invite.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center">
                          <img 
                            src={invite.image} 
                            alt={invite.name} 
                            className="w-12 h-12 rounded-full object-cover mr-3"
                          />
                          <div>
                            <h3 className="font-medium">{invite.name}</h3>
                            <p className="text-gray-500 text-xs">{invite.username}</p>
                            <p className="text-gray-400 text-xs mt-1">Sent {invite.date}</p>
                          </div>
                        </div>
                        <div className="flex">
                          <button 
                            onClick={() => handleAcceptInvite(invite.id)}
                            className="p-2 bg-primary text-white rounded-full mr-2 hover:bg-primary-dark"
                          >
                            <FaCheck />
                          </button>
                          <button 
                            onClick={() => handleRejectInvite(invite.id)}
                            className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
                          >
                            <FaTimesIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No pending invites</h3>
                    <p className="text-sm text-gray-500 mb-4">You don't have any friend requests at the moment</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Add Friend Panel */}
          {showAddFriend && (
            <div className="pt-3 w-full md:w-2/5 lg:w-1/3 bg-white border-l border-gray-200 flex flex-col h-screen overflow-hidden">
              <div className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
                <div className="flex items-center mb-3">
                  <FaUserPlus className="text-primary text-xl mr-3" />
                  <h2 className="font-bold text-lg">Add Friend</h2>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setShowAddFriend(false)}
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
              
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-medium text-lg mb-4">Send Friend Invitation</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      placeholder="Enter email or username"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={handleSendInvite}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Send Invitation
                  </button>
                  
                  <div className="mt-8">
                    <h4 className="font-medium mb-3">Suggested Friends</h4>
                    <div className="space-y-3">
                      {[1, 2, 3].map(id => (
                        <div key={id} className="flex items-center justify-between p-3 border border-gray-100 rounded-md">
                          <div className="flex items-center">
                            <img 
                              src={`https://randomuser.me/api/portraits/${id % 2 === 0 ? 'women' : 'men'}/${20 + id}.jpg`} 
                              alt="Suggested friend" 
                              className="w-10 h-10 rounded-full object-cover mr-3" 
                            />
                            <div>
                              <p className="font-medium">Suggested Friend {id}</p>
                              <p className="text-gray-500 text-xs">@suggested_{id}</p>
                            </div>
                          </div>
                          <button className="text-primary hover:text-primary-dark">
                            <FaUserPlus />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}

export default Friends;

