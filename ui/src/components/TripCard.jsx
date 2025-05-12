import React, { useState } from "react";
import { FaClock, FaUsers, FaLocationDot, FaEye, FaHeart } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";

function TripCard({ 
  image, 
  name, 
  date, 
  days, 
  people, 
  destinations, 
  location,
  isSavedPlace = false,
  isSaved,
  onToggleSave
}) {
  const [showModal, setShowModal] = useState(false);
  
  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (isSaved) {
      setShowModal(true);
      document.body.classList.add('overflow-hidden');
    } else {
      onToggleSave && onToggleSave();
    }
  };
  
  const confirmRemove = () => {
    setShowModal(false);
    document.body.classList.remove('overflow-hidden');
    onToggleSave && onToggleSave();
  };
  
  const cancelRemove = () => {
    setShowModal(false);
    document.body.classList.remove('overflow-hidden');
  };
  
  return (
    <>
      <div className="card w-[15rem] h-[15rem] rounded-xl overflow-hidden shadow-sm relative">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover absolute"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1)_0%,transparent_40%,rgba(255,255,255,0.7)_70%,rgba(255,255,255,1)_100%)]"></div>

        <div className="card-body relative z-10 flex flex-col justify-between h-[15rem] p-2 pb-6">
          <div className="flex flex-wrap gap-1">
            {!isSavedPlace && (
              <>
                <div className="badge bg-white text-gray-800 gap-1 p-2 rounded-md">
                  <FaClock className="text-gray-600" />
                  <span className="font-bold">{days} <span className="font-normal">days</span> </span>
                </div>

                <div className="badge bg-white text-gray-800 gap-1 p-2 rounded-md">
                  <FaUsers className="text-gray-600" />
                  <span className="font-bold">{people} <span className="font-normal">people</span></span>
                </div>

                <div className="badge bg-white text-gray-800 gap-1 p-2 rounded-md">
                  <FaLocationDot className="text-gray-600" />
                  <span className="font-bold">{destinations} <span className="font-normal">destinations</span></span>
                </div>
              </>
            )}
          </div>

          <div className="absolute right-2 top-2">
            {!isSavedPlace && (
              <button className="btn btn-circle btn-xs bg-gray-700/70 text-white border-none hover:bg-gray-600">
                <FaEye className="h-3 w-3" />
              </button>
            )}
            
            {isSavedPlace && (
              <button 
                className="btn btn-circle btn-xs bg-white text-red-500 border-none hover:bg-gray-100"
                onClick={handleHeartClick}
              >
                {isSaved ? (
                  <FaHeart className="h-3 w-3" />
                ) : (
                  <FaRegHeart className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          <div className="mt-auto text-secondary">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1">{name}</h2>
                {!isSavedPlace && date && <p className="text-secondary/70">{date}</p>}
                {isSavedPlace && location && <p className="text-secondary/70">{location}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Modal implementation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" 
             style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}
             onClick={cancelRemove}>
          <div 
            className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto relative"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Remove from Saved Places</h3>
            <p className="py-4">Are you sure you want to remove <span className="font-semibold">{name}</span> from your saved places?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" 
                onClick={cancelRemove}>
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-500" 
                onClick={confirmRemove}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TripCard;