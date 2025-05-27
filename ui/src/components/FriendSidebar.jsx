import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import SidebarTripListItem from "./SidebarTripListItem";
import { axiosUser, axiosInstance, axiosPlace } from "../utils/axiosInstance";

const FriendSidebar = ({
  selectedFriend,
  selectedFriendStats,
  activeTab,
  setActiveTab,
  setSelectedFriend,
  setNotification,
  navigate
}) => {
  const [allTrips, setAllTrips] = useState([]);
  const [allTripsLoading, setAllTripsLoading] = useState(false);
  const [tripCards, setTripCards] = useState([]);
  const [tripCardsLoading, setTripCardsLoading] = useState(false);
  const [photoCache, setPhotoCache] = useState({});
  const [sharedTrips, setSharedTrips] = useState([]);
  const [sharedTripsLoading, setSharedTripsLoading] = useState(false);
  const [sharedTripCards, setSharedTripCards] = useState([]);
  const [sharedTripCardsLoading, setSharedTripCardsLoading] = useState(false);

  // Fetch all trip IDs for the friend
  useEffect(() => {
    const fetchAllTrips = async () => {
      if (selectedFriend && activeTab === "all") {
        setAllTripsLoading(true);
        try {
          const res = await axiosUser.get(`/trip-info/trips/${selectedFriend.id || selectedFriend.friend_id}`);
          setAllTrips(res.data?.data?.trip_ids || []);
        } catch (e) {
          setAllTrips([]);
        }
        setAllTripsLoading(false);
      }
    };
    fetchAllTrips();
  }, [selectedFriend, activeTab]);

  // Fetch shared trips when 'Trips Together' tab is selected
  useEffect(() => {
    const fetchSharedTrips = async () => {
      if (activeTab === "with_you" && selectedFriend) {
        setSharedTripsLoading(true);
        try {
          const res = await axiosUser.get(`/trip-info/shared-trips/${selectedFriend.id || selectedFriend.friend_id}`);
          setSharedTrips(res.data?.data?.shared_trips_ids || []);
        } catch (e) {
          setSharedTrips([]);
        }
        setSharedTripsLoading(false);
      }
    };
    fetchSharedTrips();
  }, [selectedFriend, activeTab]);

  // Fetch trip details for shared trips when sharedTrips changes
  useEffect(() => {
    const fetchSharedTripDetails = async () => {
      if (activeTab !== "with_you" || !sharedTrips.length) {
        setSharedTripCards([]);
        return;
      }
      setSharedTripCardsLoading(true);
      const tripDetailsPromises = sharedTrips.map(async (tripId) => {
        try {
          const tripResponse = await axiosInstance.get(`/trips/${tripId}`);
          let peopleCount = 0;
          try {
            const participantsRes = await axiosUser.get(`/trips/participants/${tripId}`);
            if (Array.isArray(participantsRes.data)) {
              peopleCount = participantsRes.data.length;
            }
          } catch (e) {
            peopleCount = 0;
          }
          if (tripResponse.data && tripResponse.data.response && tripResponse.data.response.itinerary) {
            const itinerary = tripResponse.data.response.itinerary;
            const imageUrl = await getFirstPhotoUrl(itinerary);
            return {
              id: tripId,
              name: itinerary.name || 'Unnamed Trip',
              date: formatTripDates(itinerary.start_date, itinerary.end_date),
              days: itinerary.days ? itinerary.days.length : 0,
              people: peopleCount,
              destinations: getDestinationsCount(itinerary),
              image: imageUrl,
            };
          } else {
            return {
              id: tripId,
              name: 'Trip data unavailable',
              date: 'Unknown dates',
              days: 0,
              people: peopleCount,
              destinations: 0,
              image: generatePlaceholderImage('error-trip'),
            };
          }
        } catch (error) {
          return {
            id: tripId,
            name: 'Trip data unavailable',
            date: 'Unknown dates',
            days: 0,
            people: 0,
            destinations: 0,
            image: generatePlaceholderImage('error-trip'),
          };
        }
      });
      const details = await Promise.all(tripDetailsPromises);
      setSharedTripCards(details);
      setSharedTripCardsLoading(false);
    };
    fetchSharedTripDetails();
  }, [sharedTrips, activeTab]);

  // Helper: generate placeholder image
  const generatePlaceholderImage = (seed) => {
    const seedStr = typeof seed === "string" ? seed : "place";
    const cleanSeed = seedStr.replace(/[^a-zA-Z0-9]/g, "");
    return `https://picsum.photos/seed/${encodeURIComponent(cleanSeed)}/400/300`;
  };

  // Helper: get photo URL for a place
  const getPhotoUrl = async (place) => {
    if (!place || !place.photos || !place.photos.length) {
      return generatePlaceholderImage(place ? place.name : "place");
    }
    const placeId = place.id || place.name;
    if (photoCache[placeId]) {
      return photoCache[placeId];
    }
    const photo = place.photos[0];
    try {
      const response = await axiosPlace.post("/places/photo", { gRPC: photo.name });
      if (response.status === 429) {
        return getPhotoUrl(place); // Retry if rate limited
      }
      const photoUrl = response.data?.uri;
      setPhotoCache(prev => ({ ...prev, [placeId]: photoUrl }));
      return photoUrl;
    } catch (error) {
      return generatePlaceholderImage(place.name);
    }
  };

  // Helper: get first photo URL for a trip itinerary
  const getFirstPhotoUrl = async (itinerary) => {
    try {
      if (itinerary && itinerary.days && itinerary.days.length > 0) {
        const firstDay = itinerary.days[0];
        for (const timeSlot of ["morning_activities", "afternoon_activities", "evening_activities"]) {
          if (firstDay[timeSlot] && firstDay[timeSlot].length > 0) {
            const firstActivity = firstDay[timeSlot][0];
            if (firstActivity && firstActivity.place) {
              return await getPhotoUrl(firstActivity.place);
            }
          }
        }
      }
      return generatePlaceholderImage(itinerary?.name || "trip");
    } catch (error) {
      return generatePlaceholderImage(itinerary?.name || "trip");
    }
  };

  // Helper: format trip dates
  const formatTripDates = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startMonth = start.toLocaleString('default', { month: 'short' });
      const endMonth = end.toLocaleString('default', { month: 'short' });
      const startDay = start.getDate();
      const endDay = end.getDate();
      const year = end.getFullYear();
      if (startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}, ${year}`;
      }
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Helper: get count of unique destinations
  const getDestinationsCount = (itinerary) => {
    try {
      if (!itinerary || !itinerary.days) return 0;
      const uniquePlaceIds = new Set();
      itinerary.days.forEach(day => {
        if (!day) return;
        ["morning_activities", "afternoon_activities", "evening_activities"].forEach(timeSlot => {
          if (!day[timeSlot]) return;
          day[timeSlot].forEach(activity => {
            if (activity && activity.place && activity.place.id) {
              uniquePlaceIds.add(activity.place.id);
            }
          });
        });
      });
      return uniquePlaceIds.size;
    } catch (error) {
      return 0;
    }
  };

  // Fetch trip details for allTrips when activeTab is 'all'
  useEffect(() => {
    const fetchTripDetails = async () => {
      if (activeTab !== "all" || !allTrips.length) {
        setTripCards([]);
        return;
      }
      setTripCardsLoading(true);
      const tripDetailsPromises = allTrips.map(async (tripId) => {
        try {
          const tripResponse = await axiosInstance.get(`/trips/${tripId}`);
          let peopleCount = 0;
          try {
            const participantsRes = await axiosUser.get(`/trips/participants/${tripId}`);
            if (Array.isArray(participantsRes.data)) {
              peopleCount = participantsRes.data.length;
            }
          } catch (e) {
            peopleCount = 0;
          }
          if (tripResponse.data && tripResponse.data.response && tripResponse.data.response.itinerary) {
            const itinerary = tripResponse.data.response.itinerary;
            const imageUrl = await getFirstPhotoUrl(itinerary);
            return {
              id: tripId,
              name: itinerary.name || 'Unnamed Trip',
              date: formatTripDates(itinerary.start_date, itinerary.end_date),
              days: itinerary.days ? itinerary.days.length : 0,
              people: peopleCount,
              destinations: getDestinationsCount(itinerary),
              image: imageUrl,
            };
          } else {
            return {
              id: tripId,
              name: 'Trip data unavailable',
              date: 'Unknown dates',
              days: 0,
              people: peopleCount,
              destinations: 0,
              image: generatePlaceholderImage('error-trip'),
            };
          }
        } catch (error) {
          return {
            id: tripId,
            name: 'Trip data unavailable',
            date: 'Unknown dates',
            days: 0,
            people: 0,
            destinations: 0,
            image: generatePlaceholderImage('error-trip'),
          };
        }
      });
      const details = await Promise.all(tripDetailsPromises);
      setTripCards(details);
      setTripCardsLoading(false);
    };
    fetchTripDetails();
  }, [allTrips, activeTab]);

  if (!selectedFriend) return null;

  return (
    <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col h-screen overflow-hidden">
      <div className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
        <div className="flex items-center">
          <img
            src={selectedFriend.avatar_url}
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
          src={selectedFriend.banner_url}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
          <h2 className="text-white text-xl font-bold">{selectedFriend.name}</h2>
          <p className="text-white/80 text-sm">{selectedFriend.bio || `Travel enthusiast with ${(selectedFriendStats?.countries_visited ?? 0)} countries visited`}</p>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between">
        <div className="text-center flex flex-col items-center px-3">
          <div className="font-bold text-lg">{selectedFriendStats?.total_trips ?? 0}</div>
          <div className="text-xs text-gray-500">Trips</div>
        </div>
        <div className="text-center flex flex-col items-center px-3">
          <div className="font-bold text-lg">{selectedFriendStats?.countries_visited ?? 0}</div>
          <div className="text-xs text-gray-500">Countries</div>
        </div>
        <div className="text-center flex flex-col items-center px-3">
          <div className="font-bold text-lg">{selectedFriendStats?.cities_visited ?? 0}</div>
          <div className="text-xs text-gray-500">Cities</div>
        </div>
        <div className="text-center flex flex-col items-center px-3">
          <div className="font-bold text-lg">{selectedFriendStats?.total_days ?? 0}</div>
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
          {selectedFriend.show_trips && (
            <button
              className={`py-3 px-4 flex-1 text-center font-medium ${activeTab === "all" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
              onClick={() => setActiveTab("all")}
            >
              All Trips
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {activeTab === "all" ? (
          allTripsLoading || tripCardsLoading ? (
            <div className="flex justify-center items-center h-32">Loading all trips...</div>
          ) : tripCards.length > 0 ? (
            <div className="flex flex-col gap-2">
              {tripCards.map(trip => (
                <SidebarTripListItem 
                  key={trip.id} 
                  {...trip} 
                  onClick={(tripId) => navigate(`/itinerary/${tripId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-1">No trips yet</h3>
              <p className="text-sm text-gray-500 mb-4">No trips found for {selectedFriend.name}</p>
            </div>
          )
        ) : (
          sharedTripsLoading || sharedTripCardsLoading ? (
            <div className="flex justify-center items-center h-32">Loading shared trips...</div>
          ) : sharedTripCards.length > 0 ? (
            <div className="flex flex-col gap-2">
              {sharedTripCards.map(trip => (
                <SidebarTripListItem 
                  key={trip.id} 
                  {...trip} 
                  onClick={(tripId) => navigate(`/itinerary/${tripId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-1">No trips yet</h3>
              <p className="text-sm text-gray-500 mb-4">You haven't traveled with {selectedFriend.name} yet</p>
              <div className="flex justify-center">
                <button
                  className="btn btn-primary border-none rounded-full mt-10 w-auto px-6 flex items-center gap-3 h-10 shadow-sm transition-all duration-400 ease-in-out"
                  onClick={() => {
                    // Pre-add the friend to localStorage for the forms page
                    const friendToAdd = {
                      id: selectedFriend.id || selectedFriend.friend_id,
                      name: selectedFriend.name,
                      tag: selectedFriend.username || selectedFriend.tag,
                      image: selectedFriend.avatar_url || selectedFriend.image || '/default-avatar.png'
                    };
                    
                    // Save the friend to localStorage so they're pre-added in forms
                    localStorage.setItem("addedUsers", JSON.stringify([friendToAdd]));
                    localStorage.setItem("isGroup", "true");
                    localStorage.setItem("Trip Dimension", "group");
                    
                    setNotification({
                      message: `Starting a new trip with ${selectedFriend.name}!`,
                      type: "success"
                    });
                    navigate('/forms');
                  }}
                >
                  <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center">
                    <span className="text-primary text-2xl font-light">+</span>
                  </div>
                  <span className="text-primary-content text-lg font-bold">Plan a Trip Together</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FriendSidebar; 