import React, { useState } from 'react';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';

// Mock data for friends - in a real app this would come from an API
const friendsData = [
  { id: 1, name: 'Ronaldo', tag: '@CR', image: 'https://i.pinimg.com/736x/1e/69/d6/1e69d69083d98c4ac2b37fcd3a21c978.jpg', selected: false },
  { id: 2, name: 'Henrique F.', tag: '@HF', image: 'https://i.pinimg.com/736x/6b/f7/56/6bf756672824e2f961d661809649f0b7.jpg', selected: false },
  { id: 3, name: 'Henrique T.', tag: '@HT', image: 'https://i.pinimg.com/736x/97/70/be/9770bee8dae261fbf16eaf952aa1e409.jpg', selected: false },
  { id: 4, name: 'João Roldão', tag: '@JR', image: 'https://i.pinimg.com/736x/60/9a/bd/609abdf28dc534359867cc8b790b708d.jpg', selected: false },
  { id: 5, name: 'Gui Rosa', tag: '@GR', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
  { id: 6, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
  { id: 7, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
  { id: 8, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
  { id: 9, name: 'Guilherme', tag: '@G', image: 'https://i.pinimg.com/736x/16/ab/4c/16ab4c80a0d1da9650a43892c7103627.jpg', selected: false },
    
];

const FriendsInviteComponent = ({ onNext, onBack }) => {
  const [friends, setFriends] = useState(friendsData);
  const [tag, setTag] = useState('');
  const [addedTags, setAddedTags] = useState([]);

  const handleFriendToggle = (id) => {
    const updatedFriends = friends.map(friend => {
      if (friend.id === id) {
        const newSelected = !friend.selected;
        
        // Update added tags based on friend selection
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
    // Remove from addedTags
    setAddedTags(addedTags.filter(tag => tag !== tagToRemove));
    
    // Update selected status in friends array
    setFriends(friends.map(friend => 
      friend.tag === tagToRemove ? { ...friend, selected: false } : friend
    ));
  };

  return (
    <div className="text-center p-6">
      <h2 className="text-3xl font-bold mb-10">Add a friends to your trips</h2>
      
      <div className="flex justify-between">
        <div className="w-1/2 pr-10 border-r">
          <h3 className="text-lg font-bold mb-6">Your Friends</h3>
          <div className="grid grid-cols-4 gap-4">
            {friends.map(friend => (
              <div key={friend.id} className="flex flex-col items-center">
                <div className="relative mb-2">
                  <img 
                    src={friend.image} 
                    alt={friend.name} 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <button 
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${friend.selected ? 'bg-gray-600 text-white' : 'bg-primary text-white'}`}
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
                      <FaTimes className='text-secondary/30 ' size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-12">
        <button 
          onClick={onBack} 
          className="px-4 py-2 text-primary hover:text-rose-700 flex items-center"
        >
          Back
        </button>
        <button 
          onClick={onNext} 
          className="px-4 py-2 text-primary hover:text-rose-700 flex items-center"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FriendsInviteComponent; 