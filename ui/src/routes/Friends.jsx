import React, { useState } from "react";
import PageTemplate from "../components/PageTemplate";
import SearchBar from "../components/SearchBar";
import TripCard from "../components/TripCard";
import FriendCard from "../components/FriendCard";
import { FaTimes, FaUserFriends } from "react-icons/fa";
import friendsData from "../../public/friends.json";


function Friends() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeTab, setActiveTab] = useState("with_you");
  const [filterOpen, setFilterOpen] = useState(false);

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
      <div className="h-full flex flex-col">
        <div className="flex flex-1 h-full">
          <div className={`flex-1 flex flex-col ${selectedFriend ? 'hidden md:flex' : ''}`}>
            <div className="bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-10 mt-3">
              <div className="flex items-center">
                <FaUserFriends className="text-primary text-xl mr-3" />
                <h1 className="text-2xl font-bold">Friends</h1>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              <div className="mb-6">
                <SearchBar 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onCreateNew={handleCreateNew}
                  createButtonText="Add Friend"
                  placeholder="Search for friends"
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

          {selectedFriend && (
            <div className="pt-3 w-full md:w-2/5 lg:w-1/3 bg-white border-l border-gray-200 flex flex-col h-screen overflow-hidden">
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
        </div>
      </div>
    </PageTemplate>
  );
}

export default Friends;

