import React from "react";

const SidebarTripListItem = ({ id, image, name, date, days, people, destinations, onClick }) => {
  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer w-full min-w-0"
      onClick={() => onClick && onClick(id)}
    >
      <img
        src={image}
        alt={name}
        className="w-12 h-12 rounded-md object-cover flex-shrink-0 border border-gray-200"
      />
      <div className="flex flex-col min-w-0">
        <div className="font-semibold text-sm truncate">{name}</div>
        <div className="text-xs text-gray-500 truncate">{date}</div>
        <div className="flex gap-2 mt-1 text-xs text-gray-400">
          <span>🗓️ {days} days</span>
          <span>👥 {people} people</span>
          <span>📍 {destinations} destinations</span>
        </div>
      </div>
    </div>
  );
};

export default SidebarTripListItem; 