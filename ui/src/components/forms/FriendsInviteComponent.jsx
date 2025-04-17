import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';
import { TiArrowLeft, TiArrowRight } from 'react-icons/ti';
import '../../../src/styles/scrollbar.css';


const friendsData = [
  { id: 1, name: 'Ronaldo', tag: '@CR', image: 'https://i.pinimg.com/736x/1e/69/d6/1e69d69083d98c4ac2b37fcd3a21c978.jpg', selected: false },
  { id: 2, name: 'Henrique F.', tag: '@HF', image: 'https://i.pinimg.com/736x/6b/f7/56/6bf756672824e2f961d661809649f0b7.jpg', selected: false },
  { id: 3, name: 'Henrique T.', tag: '@HT', image: 'https://i.pinimg.com/736x/97/70/be/9770bee8dae261fbf16eaf952aa1e409.jpg', selected: false },
  { id: 4, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
  { id: 5, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
  { id: 6, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
  { id: 7, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
  { id: 8, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
  { id: 9, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
];

const FriendsInviteComponent = ({ onNext, onBack }) => {
  const [friends, setFriends] = useState(friendsData);
  const [tag, setTag] = useState('');
  const [addedTags, setAddedTags] = useState([]);
  const friendsContainerRef = useRef(null);
  const scrollbarContainerRef = useRef(null);

  const handleFriendToggle = (id) => {
    const updatedFriends = friends.map(friend => {
      if (friend.id === id) {
        const newSelected = !friend.selected;
        
        if (newSelected && !addedTags.includes(friend.tag)) {
          setAddedTags([...addedTags, friend.tag]);
        } else if (!newSelected) {
          setAddedTags(addedTags.filter(t => t !== friend.tag));
        }
        
        return { ...friend, selected: newSelected };
      }
      return friend;
    });
    
    setFriends(updatedFriends);
  };

  const handleAddTag = () => {
    if (tag && !addedTags.includes(tag)) {
      setAddedTags([...addedTags, tag]);
      setTag('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setAddedTags(addedTags.filter(tag => tag !== tagToRemove));
    
    setFriends(friends.map(friend => 
      friend.tag === tagToRemove ? { ...friend, selected: false } : friend
    ));
  };

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
      <h2 className="text-3xl font-bold mb-10">Add a friends to your trips</h2>
      
      <div className="flex justify-between mb-14">
        <div className="w-1/2 pr-0" style={{ position: 'relative' }}>
          <h3 className="text-lg font-bold mb-6">Your Friends</h3>
          
          <div 
            ref={scrollbarContainerRef}
            className="relative h-90 border-r border-gray-200 scrollbar-container" 
            style={{ overflow: 'hidden' }}
          >
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
                      className={`absolute -top-3 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${friend.selected ? 'bg-gray-600 text-white' : 'bg-primary text-white'}`}
                      onClick={() => handleFriendToggle(friend.id)}
                    >
                      {friend.selected ? <FaCheck size={10} /> : <FaPlus size={10} />}
                    </button>
                  </div>
                  <span className="text-sm">{friend.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-1/2 pl-10">
          <h3 className="text-lg font-bold mb-6">Send a link</h3>
          <div className="flex items-center mb-6">
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
            </div>
            <button 
              onClick={handleAddTag}
              className="ml-2 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center"
            >
              <FaArrowRight />
            </button>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Friends Added</h3>
            <div className="flex flex-wrap gap-2">
              {addedTags.length === 0 ? (
                <span className="text-gray-400">No friends added yet</span>
              ) : (
                addedTags.map((tag, index) => (
                  <span key={index} className="bg-rose-100 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)} 
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

export default FriendsInviteComponent;