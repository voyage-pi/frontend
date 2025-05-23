import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTemplate from "../components/PageTemplate";
import SearchBar from "../components/SearchBar";
import TripCard from "../components/TripCard";
import FriendCard from "../components/FriendCard";
import { FaTimes, FaUserFriends, FaEnvelope, FaUserPlus, FaCheck, FaTimes as FaTimesIcon, FaBell, FaClock } from "react-icons/fa";
import { useNotifications } from "../context/NotificationsContext";
import Notification from "../components/Notification";
import InboxComponent from "../components/InboxComponent";
import { AnimatePresence, motion } from "framer-motion";
import { axiosUser } from "../utils/axiosInstance";
import FriendSidebar from "../components/FriendSidebar";
import AddFriendSidebar from "../components/AddFriendSidebar";

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
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState(null);
  const { LoggedUser, isAuthenticated, isUserLoading } = useAuth();
  const { userTag } = useParams(); // Get userTag from URL params
  const navigate = useNavigate();
  
  // Determine if we're viewing our own friends or someone else's
  const [viewingUser, setViewingUser] = useState(null);
  const isViewingOwnFriends = !userTag || (LoggedUser && userTag === LoggedUser.tag);
  
  // Get notification state from context
  const { 
    friendRequestCount, 
    removeFriendRequest, 
    refreshNotifications
  } = useNotifications();

  useEffect(() => {
    // Fetch notifications when Inbox opens
    refreshNotifications();
    // Only run on mount
    // eslint-disable-next-line
  }, []);
  
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
  
  // Fetch sent friend requests
  useEffect(() => {
    const fetchSentRequests = async () => {
      if (LoggedUser && isViewingOwnFriends) {
        try {
          setIsLoading(true);
          const response = await axiosUser.get(`/friends/requests/sent/users/`);
          if (response.data && !response.data.message) {
            const sentRequests = response.data.map(request => {
              const email = request.email || request.username || "";
              return {
                id: request.id || request.friend_id,
                email: email,
                name: request.name || (email.includes('@') ? email.split('@')[0] : email),
                date: request.created_at ? new Date(request.created_at).toLocaleDateString() : "Just now"
              };
            });
            setSentInvitations(sentRequests);
          } else {
            setSentInvitations([]);
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching sent friend requests:", error);
          setIsLoading(false);
        }
      }
    };
    
    fetchSentRequests();
  }, [LoggedUser, isViewingOwnFriends]);

  // Add a ref to track previous fetches
  const fetchedForUserRef = useRef(null);
  const fetchDebounceTimeoutRef = useRef(null);
  
  // Load friends data based on the user we're viewing
  useEffect(() => {
    const fetchFriends = async () => {
      if (!isAuthenticated || isUserLoading) return;
      
      const userToFetch = isViewingOwnFriends ? LoggedUser : viewingUser;
      
      if (!userToFetch || !userToFetch.id) {
        console.log("No valid user to fetch friends for");
        return;
      }
      
      // Skip if we've already fetched for this user recently
      if (fetchedForUserRef.current === userToFetch.id) {
        console.log(`Already fetched friends for user ${userToFetch.id}, skipping`);
        return;
      }
      
      // Debounce the fetch to prevent multiple rapid calls
      if (fetchDebounceTimeoutRef.current) {
        clearTimeout(fetchDebounceTimeoutRef.current);
      }
      
      fetchDebounceTimeoutRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          console.log(`Fetching friends for user ${userToFetch.id}`);
          
          // Use the authenticated endpoint if viewing own friends
          const endpoint = isViewingOwnFriends 
            ? '/friends/users/' 
            : `/friends/users/${userToFetch.id}`;
            
          const response = await axiosUser.get(endpoint);
          console.log("Friends API response:", response);

          const friendsData = response.data;
          
          if (friendsData && Array.isArray(friendsData) && !friendsData.message) {
            // Process all friends in parallel with Promise.all
            const friendsPromises = friendsData.map(async (friend) => {
              try {
                const userResponse = await axiosUser.get(`/user/${friend.friend_id}`);
                const userData = userResponse.data;
                
                return {
                  ...userData
                };
              } catch (error) {
                console.error(`Error fetching user ${friend.friend_id}:`, error);
                return null;
              }
            });

            // Wait for all the friend data to be fetched
            const friendsList = await Promise.all(friendsPromises);
            console.log("Processed friends list:", friendsList);
            
            // Filter out any null values from failed fetches
            const validFriends = friendsList.filter(f => f !== null);
            setFriends(validFriends);
            
            // Mark that we've fetched for this user
            fetchedForUserRef.current = userToFetch.id;
          } else if (friendsData && friendsData.message) {
            console.log("Friends response message:", friendsData.message);
            setFriends([]);
          } else {
            setFriends([]);
          }
        } catch (error) {
          console.error("Error fetching friends:", error);
          setFriends([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce
    };
    
    fetchFriends();
    
    // Cleanup the timeout on unmount
    return () => {
      if (fetchDebounceTimeoutRef.current) {
        clearTimeout(fetchDebounceTimeoutRef.current);
      }
    };
  }, [isViewingOwnFriends, LoggedUser, viewingUser, isAuthenticated, isUserLoading]);

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

  // Create filtered friends with proper error handling
  const filteredFriends = useMemo(() => {
    // Ensure friends array exists and has items
    if (!friends || !Array.isArray(friends) || friends.length === 0) {
      return [];
    }
    
    // Filter by search term if provided
    return friends.filter(friend => {
      if (!friend) return false;
      
      const name = friend.name || '';
      const username = friend.username || friend.tag || '';
      const email = friend.email || '';
      
      const searchLower = searchTerm.toLowerCase();
      return name.toLowerCase().includes(searchLower) || 
             username.toLowerCase().includes(searchLower) ||
             email.toLowerCase().includes(searchLower);
    });
  }, [friends, searchTerm]);

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
      setNotification({
        message: "You can only view invites on your own friends page",
        type: "warning"
      });
      return;
    }
    
    // When showing invites, toggle the state
    setShowInvites(prevState => {
      // Only close other panels if we're opening the invites panel
      if (!prevState) {
        // Close other panels
        setSelectedFriend(null);
        setShowAddFriend(false);
      }
      return !prevState;
    });
  };
  
  // New function to search for users
  const searchUsers = async (term) => {
    if (!term.trim() || term.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await axiosUser.get('/friends/search', {
        params: {
          term: term,
          current_user_id: LoggedUser?.id
        }
      });
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          setSearchResults([]);
        } else {
          setSearchResults(response.data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            tag: user.tag,
            image: user.avatar_url,
          })));
        }
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching for users:", error);
      setNotification({
        message: "Error searching for users. Please try again.",
        type: "error"
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search to avoid too many requests
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (showAddFriend && friendEmail) {
        searchUsers(friendEmail);
      }
    }, 500);
    
    return () => clearTimeout(delayDebounce);
  }, [friendEmail, showAddFriend, LoggedUser?.id]);

  const handleUserSelect = (user) => {
    setSelectedUserToAdd(user);
    setFriendEmail(user.email || user.username || user.id);
  };
  
  const handleSendInvite = async () => {
    // If a user has been selected, use their ID directly
    if (selectedUserToAdd && !LoggedUser) return;
    
    if (!selectedUserToAdd && (!friendEmail.trim() || !LoggedUser)) return;
    
    try {
      // Send friend request
      const friendIdentifier = selectedUserToAdd ? selectedUserToAdd.id : friendEmail;
      const friendDisplayName = selectedUserToAdd ? selectedUserToAdd.name : friendEmail;
      
      const response = await axiosUser.post('/friends/requests', {
        friend_id: parseInt(friendIdentifier) //Only need the friend_id now
      });
      
      if (response.data) {
        setSentToEmail(friendDisplayName);
        setInviteSent(true);
        
        // Display custom message if available
        if (response.data.message) {
          setNotification({
            message: response.data.message,
            type: "success"
          });
        }
        
        // Add to sent invitations
        const newInvitation = {
          id: Date.now(),
          email: selectedUserToAdd ? selectedUserToAdd.email || selectedUserToAdd.username : friendEmail,
          name: selectedUserToAdd ? selectedUserToAdd.name : friendEmail.split('@')[0],
          date: "Just now"
        };
        
        setSentInvitations([newInvitation, ...sentInvitations]);
        setFriendEmail("");
        setSelectedUserToAdd(null);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      let errorMessage = "Error sending friend request. Please try again.";
      
      // Check for specific error responses
      if (error.response) {
        if (error.response.status === 422) {
          errorMessage = "Invalid request. Please check the email or username and try again.";
        } else if (error.response.status === 404) {
          errorMessage = "User not found. Please check the email or username and try again.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setNotification({
        message: errorMessage,
        type: "error"
      });
    }
  };
  
  const handleNotificationClose = () => {
    setNotification(null);
  };

  const [selectedFriendStats, setSelectedFriendStats] = useState(null);

  useEffect(() => {
    if (selectedFriend) {
      axiosUser.get(`/trip-info/stats/${selectedFriend.friend_id || selectedFriend.id}`)
        .then(res => setSelectedFriendStats(res.data.data))
        .catch(() => setSelectedFriendStats(null));
    }
  }, [selectedFriend]);

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
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <SearchBar 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onCreateNew={isViewingOwnFriends ? handleCreateNew : null}
                    createButtonText="Add Friend"
                    placeholder="Search for friends"
                  />
                </div>
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

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredFriends.length > 0 ? (
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
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-100 mt-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No friends yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {isViewingOwnFriends 
                      ? "Start adding friends to connect with travel buddies" 
                      : "This user hasn't added any friends yet"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            {/* Friend Details Panel */}
            {selectedFriend && !showInvites && !showAddFriend && (
              <FriendSidebar
                selectedFriend={selectedFriend}
                selectedFriendStats={selectedFriendStats}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setSelectedFriend={setSelectedFriend}
                setNotification={setNotification}
                navigate={navigate}
              />
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
                    currentUserId={LoggedUser?.id}
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
                  <AddFriendSidebar
                    onClose={() => {
                      setShowAddFriend(false);
                      setSearchResults([]);
                      setSelectedUserToAdd(null);
                    }}
                    friendEmail={friendEmail}
                    setFriendEmail={setFriendEmail}
                    selectedUserToAdd={selectedUserToAdd}
                    setSelectedUserToAdd={setSelectedUserToAdd}
                    searchResults={searchResults}
                    setSearchResults={setSearchResults}
                    isSearching={isSearching}
                    inviteSent={inviteSent}
                    sentToEmail={sentToEmail}
                    handleSendInvite={handleSendInvite}
                    sentInvitations={sentInvitations}
                    handleUserSelect={handleUserSelect}
                  />
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

