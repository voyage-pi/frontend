import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaGlobeAmericas, FaPlane } from "react-icons/fa";
import { axiosUser } from "../utils/axiosInstance";

const FriendCard = ({ friend, onClick, selected }) => {
  const [stats, setStats] = useState(null);
  const [lastTrip, setLastTrip] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosUser.get(`/trip-info/stats/${friend.friend_id || friend.id}`);
        setStats(res.data.data);
      } catch (e) {
        setStats(null);
      }
    };
    fetchStats();
  }, [friend]);

  useEffect(() => {
    const fetchLastTrip = async () => {
      if (!friend) return;
      try {
        const res = await axiosUser.get(`/trip-info/last-shared-trip/${friend.friend_id || friend.id}`);
        const tripDetails = res.data?.data?.data;
        if (tripDetails && tripDetails.name) {
          setLastTrip(tripDetails);
        } else {
          setLastTrip(null);
        }
      } catch (e) {
        setLastTrip(null);
      }
    };
    fetchLastTrip();
  }, [friend]);

  return (
    <div 
      className={`w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-102 ${selected ? 'border-1 border-primary/30' : 'border border-gray-100'}`}
      onClick={() => onClick(friend)}
    >
      {/* Cover Photo */}
      <div className="h-24 bg-gray-200 w-full overflow-hidden">
        <img 
          src={friend.banner_url} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="px-4 pb-4 relative">
        {/* Profile Photo */}
        <div className="absolute -top-12 left-4 border-4 border-white rounded-full overflow-hidden shadow-sm transition-transform duration-300">
          <img 
            src={friend.avatar_url} 
            alt={friend.name} 
            className="w-20 h-20 object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="pt-12 pb-2">
          <h3 className="font-bold text-lg">{friend.name}</h3>
          <p className="text-gray-500 text-sm mb-3">{friend.username}</p>
          
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-2">
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <FaPlane className="text-primary" />
              <span>{stats ? stats.total_trips : 0} trips</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <FaGlobeAmericas className="text-primary" />
              <span>{stats ? stats.countries_visited : 0} countries</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <FaMapMarkerAlt className="text-primary" />
              <span>{stats ? stats.cities_visited : 0} cities</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Last trip together:</p>
            {lastTrip ? (
              <div>
                <p className="text-sm font-medium">
                  {`${lastTrip.name}`} <span className="text-xs text-gray-400">({lastTrip.start_date && lastTrip.end_date
                    ? `${new Date(lastTrip.start_date).toLocaleDateString()} - ${new Date(lastTrip.end_date).toLocaleDateString()}`
                    : lastTrip.start_date
                      ? new Date(lastTrip.start_date).toLocaleDateString()
                      : null
                  })</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">You still don't have trips together</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard; 