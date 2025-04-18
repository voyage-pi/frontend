import React, { useState } from "react";
import PageTemplate from "../components/PageTemplate";
import SearchBar from "../components/SearchBar";
import TripCard from "../components/TripCard";
import { FaTimes } from "react-icons/fa";
import friendsData from "../../public/friends.json";


function Friends() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeTab, setActiveTab] = useState("with_you");

  const filteredFriends = friendsData.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
  };

  const handleCreateNew = () => {
    console.log("Create new friend");
  };

  return (
    <PageTemplate>
      <div className="h-full flex">
        {/* Left division: search and friends list */}
        <div className={`p-8 flex flex-col ${selectedFriend ? 'w-3/5' : 'w-full'}`}>
          <h1 className="text-3xl font-bold mb-6">My Friends</h1>
          
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onCreateNew={handleCreateNew}
            createButtonText="Add Friend"
            placeholder="Search for friends"
          />

          <div className="flex-1 mt-6 overflow-y-auto pr-4">
            <div className={`grid ${selectedFriend ? 'grid-cols-5 gap-6' : 'grid-cols-6 gap-6'}`}>
              {filteredFriends.map(friend => (
                <div 
                  key={friend.id} 
                  className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity mb-6"
                  onClick={() => handleFriendClick(friend)}
                >
                  <div className="relative mb-2">
                    <img 
                      src={friend.image} 
                      alt={friend.name} 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  </div>
                  <span className="text-base font-medium">{friend.name}</span>
                  <span className="text-xs text-gray-500">{friend.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right division: friend details */}
        {selectedFriend && (
          <div className="w-2/5 bg-white animate-slideIn flex flex-col h-screen max-h-screen overflow-hidden">
            <div className="p-6 flex items-center border-b border-gray-100">
              <div className="relative mr-4">
                <img 
                  src={selectedFriend.image} 
                  alt={selectedFriend.name} 
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedFriend.name}</h2>
                <p className="text-gray-500 text-sm">{selectedFriend.username}</p>
              </div>
              <button 
                className="ml-auto text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => setSelectedFriend(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-0 py-4 border-b border-gray-100">
              <div className="text-center">
                <div className="font-bold text-xl">{selectedFriend.trips}</div>
                <div className="text-xs text-gray-500">Trips</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">{selectedFriend.countries}</div>
                <div className="text-xs text-gray-500">Countries</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">{selectedFriend.cities}</div>
                <div className="text-xs text-gray-500">Cities</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">{selectedFriend.months}</div>
                <div className="text-xs text-gray-500">Months</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">{selectedFriend.days}</div>
                <div className="text-xs text-gray-500">Days</div>
              </div>
            </div>

            <div className="border-b border-gray-100">
              <div className="flex px-6">
                <button 
                  className={`py-3 px-2 mr-4 ${activeTab === "with_you" ? "border-b-2 border-primary text-primary font-medium" : "text-gray-400"}`}
                  onClick={() => setActiveTab("with_you")}
                >
                  With You
                </button>
                <button 
                  className={`py-3 px-2 ${activeTab === "all" ? "border-b-2 border-primary text-primary font-medium" : "text-gray-400"}`}
                  onClick={() => setActiveTab("all")}
                >
                  All
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedFriend.trips_data.length > 0 ? (
                  selectedFriend.trips_data.map(trip => (
                    <TripCard
                      key={trip.id}
                      image={trip.image}
                      days={trip.days}
                      people={trip.people}
                      destinations={trip.destinations}
                      name={trip.name}
                      date={trip.date}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2 text-center py-8">No trips available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}

export default Friends;

