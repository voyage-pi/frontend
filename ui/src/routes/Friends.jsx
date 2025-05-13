import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTemplate from "../components/PageTemplate";
import SearchBar from "../components/SearchBar";
import TripCard from "../components/TripCard";
import FriendCard from "../components/FriendCard";
import { FaTimes, FaUserFriends, FaEnvelope, FaUserPlus, FaCheck, FaTimes as FaTimesIcon, FaBell, FaClock } from "react-icons/fa";
import friendsData from "../../public/friends.json";
import { useNotifications } from "../context/NotificationsContext";
import Notification from "../components/Notification";
import InboxComponent from "../components/InboxComponent";
import { AnimatePresence, motion } from "framer-motion";
import { axiosUser } from "../utils/axiosInstance";

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
  const [notification, setNotification] = useState(null);
  const [sentInvitations, setSentInvitations] = useState([]);
  const { LoggedUser, isAuthenticated, isUserLoading } = useAuth();
  const { userTag } = useParams(); // Get userTag from URL params
  const navigate = useNavigate();
  
  // Determine if we're viewing our own friends or someone else's
  const [viewingUser, setViewingUser] = useState(null);
  const isViewingOwnFriends = !userTag || (LoggedUser && userTag === LoggedUser.tag);
  
  // Get notification state from context
  const { friendRequestCount, addFriendRequest } = useNotifications();
  
  // If userTag is provided but doesn't match LoggedUser, fetch that user's info
  useEffect(() => {
    const fetchUserByTag = async () => {
      if (userTag && (!LoggedUser || userTag !== LoggedUser.tag)) {
        try {
          // Fetch user info by tag
          const response = await axiosUser.get(`/user/tag/${userTag}`);
          if (response.data && response.data.response) {
            setViewingUser(response.data.response);
          }
        } catch (error) {
          console.error("Error fetching user by tag:", error);
          // If user not found, redirect to home
          navigate('/');
        }
      } else if (LoggedUser) {
        // If viewing own friends, set viewingUser to LoggedUser
        setViewingUser(LoggedUser);
      }
    };
    
    if (!isUserLoading) {
      fetchUserByTag();
    }
  }, [userTag, LoggedUser, isUserLoading, navigate]);
  
  // Initial sample data loading 
  useEffect(() => {
    // Only load sample data if no requests exist yet
    if (friendRequestCount === 0) {
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
      
      sampleInvites.forEach(invite => addFriendRequest(invite));
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

  // Load friends data based on the user we're viewing
  useEffect(() => {
    const fetchFriends = async () => {
      // For now, we're using static data, mas deve ser algo deste genero xd
      // if (viewingUser) {
      //   try {
      //     const response = await axiosUser.get(`/user/friends/${viewingUser.id}`);
      //     // Process and set friends data
      //   } catch (error) {
      //     console.error("Error fetching friends:", error);
      //   }
      // }
    };
    
    if (viewingUser) {
      fetchFriends();
    }
  }, [viewingUser]);

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
    // Only allow adding friends if viewing own friends page
    if (!isViewingOwnFriends) {
      setNotification({
        message: "You can only add friends on your own friends page",
        type: "warning"
      });
      return;
    }
    
    setShowAddFriend(true);
    setSelectedFriend(null);
    setShowInvites(false);
    setInviteSent(false);
  };
  
  const handleShowInvites = () => {
    // Only show invites if viewing own friends page
    if (!isViewingOwnFriends) {
      return;
    }
    
    setShowInvites(true);
    setSelectedFriend(null);
    setShowAddFriend(false);
  };
  
  const handleSendInvite = () => {
    if (!friendEmail.trim()) return;
    
    // api call to send invite
    setSentToEmail(friendEmail);
    setInviteSent(true);
    
    // Add to sent invitations
    const newInvitation = {
      id: Date.now(),
      email: friendEmail,
      name: friendEmail.split('@')[0],
      date: "Just now"
    };
    
    setSentInvitations([newInvitation, ...sentInvitations]);
    setFriendEmail("");
  };
  
  const handleNotificationClose = () => {
    setNotification(null);
  };

  return (
    <PageTemplate>
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="flex flex-1 h-full">
          <div className="flex-1 flex flex-col">
            <div className="bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-10 mt-3">
              <div className="flex items-center">
                <FaUserFriends className="text-primary text-xl mr-3" />
                <h1 className="text-2xl font-bold">Friends</h1>
              </div>
              <div className="flex items-center">
                <button 
                  className="p-2 px-4 relative bg-gray-100 rounded-full hover:bg-gray-200 flex items-center"
                  onClick={() => setShowInvites(!showInvites)}
                >
                  <FaEnvelope className="text-gray-600 mr-2" />
                  <span className="text-gray-600 font-medium">Inbox</span>
                  {friendRequestCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {friendRequestCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              <div className="mb-6 w-full">
                <SearchBar 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onCreateNew={isViewingOwnFriends ? handleCreateNew : null}
                  createButtonText="Add Friend"
                  placeholder="Search for friends"
                  className="w-full"
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

          <div className="relative">
            {/* Friend Details Panel */}
            {selectedFriend && !showInvites && !showAddFriend && (
              <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-screen overflow-hidden">
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
            
            {/* Friend Requests Inbox with animation */}
            <AnimatePresence>
              {showInvites && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 20 }}
                  className="absolute right-0 top-0 h-screen w-96 bg-white shadow-lg z-50 overflow-y-auto motion-container"
                >
                  <InboxComponent 
                    onClose={() => setShowInvites(false)}
                    setNotification={setNotification}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Add Friend Panel with animation */}
            <AnimatePresence>
              {showAddFriend && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 20 }}
                  className="absolute right-0 top-0 h-screen w-96 bg-white shadow-lg z-50 overflow-y-auto motion-container"
                >
                  <div className="flex flex-col h-full">
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
                    
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4">
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
                      </div>
                      
                      {/* Sent Invitations Section */}
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4">
                        <h3 className="font-medium text-lg mb-4">Sent Invitations</h3>
                        
                        {sentInvitations.length > 0 ? (
                          <div className="space-y-3">
                            {sentInvitations.map(invitation => (
                              <div key={invitation.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-md">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-gray-500 font-medium">{invitation.name.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{invitation.email}</p>
                                    <div className="flex items-center">
                                      <FaClock className="text-gray-400 text-xs mr-1" />
                                      <p className="text-gray-500 text-xs">Sent {invitation.date}</p>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Pending</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No pending invitations sent</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={handleNotificationClose}
        />
      )}
    </PageTemplate>
  );
}

export default Friends;

