import { useState, useRef, useEffect } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../styles/modal.css';

const ShareProfileModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef(null);
  const { LoggedUser } = useAuth() || { LoggedUser: null };
  
  // Generate the shareable link - you might want to modify this based on your app's URL structure
  const baseUrl = window.location.origin;
  const shareableLink = LoggedUser ? `${baseUrl}/${LoggedUser.tag}` : `${baseUrl}`;
  
  // Handle copy to clipboard without selecting text
  const handleCopy = () => {
    try {
      // Copy text directly without selecting
      navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      // Fallback method if direct clipboard access fails
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = shareableLink;
      tempTextArea.style.position = 'absolute';
      tempTextArea.style.left = '-9999px';
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };
  
  // Control modal visibility
  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling when modal is open
      document.body.classList.add('overflow-hidden');
    } else {
      // Restore scrolling when modal is closed
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);
  
  // Handle ESC key manually for closing
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" 
      style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-[500px] mx-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        
        <h3 className="font-bold text-lg mb-4">Share Your Profile</h3>
        <div className="form-control w-full">
          <div className="join w-full">
            <input
              ref={linkInputRef}
              type="text"
              readOnly
              value={shareableLink}
              className="input input-bordered join-item w-full"
              onClick={(e) => e.target.blur()} // Blur the input on click to prevent automatic selection
            />
            <button 
              className="btn btn-primary join-item"
              onClick={handleCopy}
            >
              {copied ? <FaCheck size={16} /> : <FaCopy size={16} />}
            </button>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShareProfileModal; 