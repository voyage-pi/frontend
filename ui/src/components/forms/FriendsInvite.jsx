import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';
import { TiArrowLeft, TiArrowRight } from 'react-icons/ti';
import '../../../src/styles/scrollbar.css';
import { axiosUser } from '../../utils/axiosInstance';

const FriendsInvite = ({ onNext, onBack, addedUsers, setAddedUsers }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tag, setTag] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const friendsContainerRef = useRef(null);
  const scrollbarContainerRef = useRef(null);

  // Fetch real friends on mount
  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosUser.get('/friends/users/');
        const friendsData = res.data;
        // Fetch full info for each friend
        const friendsPromises = friendsData.map(async (friend) => {
          try {
            const userRes = await axiosUser.get(`/user/${friend.friend_id || friend.id}`);
            const user = userRes.data;
            return {
              id: user.id,
              name: user.name || user.username || user.email,
              tag: user.username || user.email,
              image: user.avatar_url || user.image || '/default-avatar.png',
              selected: false
            };
          } catch (e) {
            return null;
          }
        });
        const friendsList = (await Promise.all(friendsPromises)).filter(Boolean);
        
        // Check if any friends should be pre-selected based on addedUsers
        const updatedFriendsList = friendsList.map(friend => ({
          ...friend,
          selected: addedUsers.some(user => user.id === friend.id)
        }));
        
        setFriends(updatedFriendsList);
      } catch (err) {
        setError('Failed to load friends.');
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [addedUsers]);

  // Handle toggling friend selection
  const handleFriendToggle = (id) => {
    setFriends(friends => friends.map(friend => {
      if (friend.id === id) {
        const newSelected = !friend.selected;
        if (newSelected) {
          // Add to addedUsers if not already present
          setAddedUsers(prev => prev.some(u => u.id === friend.id) ? prev : [...prev, friend]);
        } else {
          // Remove from addedUsers
          setAddedUsers(prev => prev.filter(u => u.id !== friend.id));
        }
        return { ...friend, selected: newSelected };
      }
      return friend;
    }));
  };

  // Search for users by tag
  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await axiosUser.get(`/friends/search?term=${encodeURIComponent(searchTerm)}`);
      let users = res.data || [];
      // If any user is missing avatar/name/tag, fetch full info
      const userPromises = users.map(async (user) => {
        if (user.avatar_url && user.name && user.username) {
          return {
            id: user.id,
            name: user.name,
            tag: user.username,
            image: user.avatar_url,
          };
        } else {
          try {
            const userRes = await axiosUser.get(`/user/${user.id}`);
            const u = userRes.data;
            return {
              id: u.id,
              name: u.name || u.username || u.email,
              tag: u.username || u.email,
              image: u.avatar_url || u.image || '/default-avatar.png',
            };
          } catch (e) {
            return null;
          }
        }
      });
      const usersList = (await Promise.all(userPromises)).filter(Boolean);
      setSearchResults(usersList);
    } catch (err) {
      setSearchError('Search failed.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add user from search or input
  const handleAddUser = (user) => {
    let userObj = null;
    if (typeof user === 'string') {
      userObj = friends.find(f => f.tag === user) || searchResults.find(u => u.tag === user);
      if (!userObj) {
        userObj = { id: user, name: user, tag: user, image: '/default-avatar.png' };
      }
    } else if (user && user.id) {
      userObj = user;
    }
    if (userObj && !addedUsers.some(u => u.id === userObj.id)) {
      setAddedUsers(prev => prev.some(u => u.id === userObj.id) ? prev : [...prev, userObj]);
      setFriends(friends => friends.map(friend =>
        friend.id === userObj.id ? { ...friend, selected: true } : friend
      ));
      setTag('');
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleAddUser(searchResults[0]);
      } else {
        handleAddUser(tag);
      }
    }
  };

  const handleRemoveUser = (idToRemove) => {
    setAddedUsers(addedUsers.filter(user => user.id !== idToRemove));
    setFriends(friends => friends.map(friend =>
      friend.id === idToRemove ? { ...friend, selected: false } : friend
    ));
  };

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (tag) handleSearch(tag);
      else setSearchResults([]);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [tag]);

  // Scrollbar logic (unchanged)
  useEffect(() => {
    const container = friendsContainerRef.current;
    const scrollbarContainer = scrollbarContainerRef.current;
    if (!container || !scrollbarContainer) return;
    const handleScroll = () => {
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollableHeight = scrollHeight - clientHeight;
      if (scrollableHeight <= 0) {
        scrollbarContainer.style.setProperty('--scroll-thumb-height', '0px');
        return;
      }
      const thumbHeightPercentage = Math.max(10, (clientHeight / scrollHeight) * 100);
      scrollbarContainer.style.setProperty('--scroll-thumb-height', `${thumbHeightPercentage}%`);
      const scrollPercentage = container.scrollTop / scrollableHeight;
      const maxTravel = 100 - thumbHeightPercentage;
      const thumbTopPosition = scrollPercentage * maxTravel;
      scrollbarContainer.style.setProperty('--scroll-thumb-top', `${thumbTopPosition}%`);
    };
    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="text-center p-6 -mb-10 flex flex-col min-h-[600px] relative">
      <h2 className="text-3xl font-bold mb-10">Add friends to the trip</h2>
      <div className="flex justify-between mb-14">
        <div className="w-1/2 pr-0" style={{ position: 'relative' }}>
          <h3 className="text-lg font-bold mb-6">Your Friends</h3>
          <div 
            ref={scrollbarContainerRef}
            className="relative h-90 border-r border-gray-200 scrollbar-container" 
            style={{ overflow: 'hidden' }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-40">Loading friends...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div 
                ref={friendsContainerRef}
                className="grid grid-cols-4 gap-4 pr-3 h-full overflow-y-scroll friends-scroll"
                style={{ paddingTop: '13px' }}
              >
                {friends.map(friend => (
                  <div key={friend.id} className="flex flex-col items-center mb-4">
                    <div className="relative mb-2">
                      <img 
                        src={friend.image} 
                        alt={friend.name} 
                        className="w-25 h-25 rounded-full object-cover"
                      />
                      <button 
                        className={`absolute -top-3 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${addedUsers.some(u => u.id === friend.id) ? 'bg-gray-600 text-white' : 'bg-primary text-white'}`}
                        onClick={() => handleFriendToggle(friend.id)}
                      >
                        {addedUsers.some(u => u.id === friend.id) ? <FaCheck size={10} /> : <FaPlus size={10} />}
                      </button>
                    </div>
                    <span className="text-sm">{friend.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2 pl-10">
          <h3 className="text-lg font-bold mb-6">Send a link</h3>
          <div className="flex items-center mb-6 relative">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                placeholder="Tag"
                className="w-full py-2 pl-8 pr-4 border border-gray-300 rounded-full"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {tag && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded shadow-md mt-1 z-10 max-h-40 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-2 text-gray-400">Searching...</div>
                  ) : searchError ? (
                    <div className="p-2 text-red-500">{searchError}</div>
                  ) : (
                    searchResults.map((user, idx) => (
                      <div
                        key={user.id || user.username || user.email || idx}
                        className="p-2 hover:bg-primary/10 cursor-pointer text-left"
                        onClick={() => handleAddUser(user)}
                      >
                        <img src={user.image} alt={user.name} className="inline-block w-6 h-6 rounded-full mr-2 align-middle" />
                        <span className="align-middle font-medium">{user.name || user.username || user.email}</span>
                        <span className="ml-2 text-xs text-gray-400">{user.tag}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                if (searchResults.length > 0) handleAddUser(searchResults[0]);
                else handleAddUser(tag);
              }}
              className="ml-2 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center"
            >
              <FaArrowRight />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Friends Added</h3>
            <div className="flex flex-wrap gap-2">
              {addedUsers.length === 0 ? (
                <span className="text-gray-400">No friends added yet</span>
              ) : (
                addedUsers.map((user, index) => (
                  <span key={user.id} className="bg-rose-100 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    <img src={user.image} alt={user.name} className="w-6 h-6 rounded-full mr-2" />
                    <span className="font-medium mr-1">{user.name}</span>
                    <span className="text-xs text-gray-400 mr-1">{user.tag}</span>
                    <button 
                      onClick={() => handleRemoveUser(user.id)} 
                      className="ml-2 hover:text-rose-800 focus:outline-none"
                      aria-label="Remove friend"
                    >
                      <FaTimes className="text-secondary/30" size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between w-full absolute bottom-2 left-0 px-6">
        <button 
          onClick={onBack} 
          className="px-4 py-2 text-primary hover:text-rose-700 flex items-center"
        >
        <TiArrowLeft className="mr-1" /> Back
        </button>
        <button 
          onClick={onNext} 
          className="px-4 py-2 text-primary hover:text-rose-700 flex items-center"
        >
          Next <TiArrowRight className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default FriendsInvite;