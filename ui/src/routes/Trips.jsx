import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTemplate from "../components/PageTemplate";
import TripCard from "../components/TripCard";
import SearchHeader from "../components/SearchBar";
import TabBar from "../components/TabBar";
import Map from "../components/Map";
import { FaEarthAmericas, FaEnvelope } from "react-icons/fa6";
import { axiosInstance, axiosUser, axiosPlace } from "../utils/axiosInstance";
import { useNotifications } from "../context/NotificationsContext";
import InboxComponent from "../components/InboxComponent";
import Notification from "../components/Notification";
import { AnimatePresence, motion } from "framer-motion";

function Trips() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoCache, setPhotoCache] = useState({});
  const [showInbox, setShowInbox] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  
  const { totalCount, addTripInvite, tripInviteCount } = useNotifications();

  // Load sample trip invites if none exist yet
  useEffect(() => {
    if (tripInviteCount === 0) {
      const sampleInvites = [
        {
          id: 201,
          tripName: "Weekend in Paris",
          from: "John Smith",
          date: "1 day ago"
        },
        {
          id: 202,
          tripName: "Tokyo Adventure",
          from: "Sarah Lee",
          date: "3 days ago"
        }
      ];
      
      sampleInvites.forEach(invite => addTripInvite(invite));
    }
  }, []);

  // Generate placeholder image as a fallback
  const generatePlaceholderImage = (seed) => {
    const seedStr = typeof seed === "string" ? seed : "place";
    const cleanSeed = seedStr.replace(/[^a-zA-Z0-9]/g, "");
    return `https://picsum.photos/seed/${encodeURIComponent(cleanSeed)}/400/300`;
  };

  // Get photo URL using the same logic as Itinerary.jsx
  const getPhotoUrl = async (place) => {
    if (!place || !place.photos || !place.photos.length) {
      console.log("No photos available for", place?.name);
      return generatePlaceholderImage(place ? place.name : "place");
    }

    const placeId = place.id || place.name;
    if (photoCache[placeId]) {
      return photoCache[placeId];
    }

    const photo = place.photos[0];
    try {
      const response = await axiosPlace.post("/places/photo", {
        gRPC: photo.name,
      });
      
      if (response.status === 429) {
        return getPhotoUrl(place); // Retry if rate limited
      }
      
      const photoUrl = response.data?.uri;
      setPhotoCache(prev => ({
        ...prev,
        [placeId]: photoUrl
      }));

      return photoUrl;
    } catch (error) {
      console.error("Error fetching photo:", error);
      return generatePlaceholderImage(place.name);
    }
  };

  // Get first photo URL for the trip card
  const getFirstPhotoUrl = async (itinerary) => {
    try {
      if (itinerary && itinerary.days && itinerary.days.length > 0) {
        const firstDay = itinerary.days[0];
        for (const timeSlot of ['morning_activities', 'afternoon_activities', 'evening_activities']) {
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
      console.error("Error getting first photo URL:", error);
      return generatePlaceholderImage(itinerary?.name || "trip");
    }
  };

  // Fetch user trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        // Use hardcoded user ID 50 for now
        const userTripsResponse = await axiosUser.get('/trips/users/50');
        console.log('User trips response:', userTripsResponse.data);
        
        // The response will be an array of user-trip associations
        if (userTripsResponse.data && Array.isArray(userTripsResponse.data)) {
          const userTrips = userTripsResponse.data;
          
          // Fetch trip details for each trip
          const tripDetailsPromises = userTrips.map(async (userTrip) => {
            try {
              if (!userTrip || !userTrip.trip_id) {
                console.error('Invalid user trip data:', userTrip);
                return null;
              }
              
              console.log(`Fetching trip details for trip ID: ${userTrip.trip_id}`);
              const tripResponse = await axiosInstance.get(`/trips/${userTrip.trip_id}`);
              console.log('Trip details response:', tripResponse.data);
              
              // The response structure follows the ResponseBody format with nested itinerary
              if (tripResponse.data && tripResponse.data.response && tripResponse.data.response.itinerary) {
                const itinerary = tripResponse.data.response.itinerary;
                
                // Debug log the itinerary structure
                console.log('Itinerary structure:', JSON.stringify({
                  has_days: Boolean(itinerary.days),
                  days_length: itinerary.days ? itinerary.days.length : 0,
                  name: itinerary.name,
                  start_date: itinerary.start_date,
                  end_date: itinerary.end_date
                }));
                
                // Fetch the photo URL
                const imageUrl = await getFirstPhotoUrl(itinerary);
                
                return {
                  id: userTrip.trip_id,
                  name: itinerary.name || 'Unnamed Trip',
                  date: formatTripDates(itinerary.start_date, itinerary.end_date),
                  days: itinerary.days ? itinerary.days.length : 0,
                  people: 1, // Default value
                  status: userTrip.status, // This comes directly from user_trips
                  destinations: getDestinationsCount(itinerary),
                  image: imageUrl,
                  markers: extractMarkers(itinerary)
                };
              } else {
                console.error('Invalid trip response structure:', tripResponse.data);
                return null;
              }
            } catch (error) {
              console.error(`Error fetching trip ${userTrip?.trip_id}:`, error);
              return null;
            }
          });
          
          const tripDetails = await Promise.all(tripDetailsPromises);
          const validTrips = tripDetails.filter(trip => trip !== null);
          console.log('Processed trips:', validTrips);
          setTrips(validTrips);
        } else {
          console.error('Invalid user trips response:', userTripsResponse.data);
          setTrips([]);
        }
      } catch (error) {
        console.error("Error fetching user trips:", error);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, []);

  // Format trip dates for display
  const formatTripDates = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Format as "Apr 19 - Apr 20, 2025"
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

  // Extract markers for the map
  const extractMarkers = (itinerary) => {
    try {
      const markers = [];
      
      if (itinerary.days) {
        itinerary.days.forEach(day => {
          ['morning_activities', 'afternoon_activities', 'evening_activities'].forEach(timeSlot => {
            if (day[timeSlot]) {
              day[timeSlot].forEach(activity => {
                if (activity.place && activity.place.location) {
                  markers.push({
                    lat: activity.place.location.latitude,
                    lng: activity.place.location.longitude,
                    name: activity.place.name
                  });
                }
              });
            }
          });
        });
      }
      
      return markers;
    } catch (error) {
      return [];
    }
  };

  // Get count of unique destinations in the itinerary
  const getDestinationsCount = (itinerary) => {
    try {
      if (!itinerary || !itinerary.days) return 0;
      const uniquePlaceIds = new Set();
      
      itinerary.days.forEach(day => {
        if (!day) return;
        
        ['morning_activities', 'afternoon_activities', 'evening_activities'].forEach(timeSlot => {
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
      console.error("Error counting destinations:", error);
      return 0;
    }
  };

  const handleCreateTrip = () => {
    navigate("/forms");
  };

  const tabs = [
    { value: "all", label: "All trips" },
    { value: "drafted", label: "Drafted" },
    { value: "incoming", label: "Incoming" },
    { value: "completed", label: "Completed" },
  ];

  const searchFiltered = trips.filter(trip =>
    trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrips = searchFiltered.filter(trip => {
    if (activeTab === "all") return true;
    if (activeTab === "drafted") return trip.status === "drafted" || trip.status === "owner";
    if (activeTab === "incoming") return trip.status === "incoming" || trip.status === "pending";
    if (activeTab === "completed") return trip.status === "completed" || trip.status === "participant";
    return true;
  });

  const allMarkers = [];
  filteredTrips.forEach(trip => {
    if (trip.markers && trip.markers.length > 0) {
      allMarkers.push(...trip.markers);
    }
  });

  const myPolylines = [
    {
      polylines: [
        {
          polylineEncoded: "",
          duration: 0,
          distance: 0
        },
      ],
    },
  ];

  return (
    <PageTemplate>
      <div className="flex flex-col overflow-hidden">
        <div className="flex">
          <div className="w-4/7">
            <div className="bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-10 mt-[0.6rem] pb-9">
              <div className="flex items-center">
                <FaEarthAmericas className="text-primary text-xl mr-3" />
                <h1 className="text-2xl font-bold">Trips</h1>
              </div>
              <div className="flex items-center">
                <button 
                  className="p-2 px-4 relative bg-gray-100 rounded-full hover:bg-gray-200 flex items-center"
                  onClick={() => setShowInbox(!showInbox)}
                >
                  <FaEnvelope className="text-gray-600 mr-2" />
                  <span className="text-gray-600 font-medium">Inbox</span>
                  {totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {totalCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="ml-4">
              <TabBar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
              />
            </div>
            <div className="px-6 pt-4 overflow-y-auto">
              <div className="mb-4">
                <SearchHeader
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onCreateNew={handleCreateTrip}
                  createButtonText="New Trip"
                  placeholder="Search..."
                />
              </div>
              
              {loading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Loading trips...</p>
                </div>
              ) : filteredTrips.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No trips found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-2 gap-y-5">
                  {filteredTrips.map((trip) => (
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
              )}
            </div>
          </div>
          
          <div className="w-3/7 h-screen relative">
            {/* Map component */}
            {!showInbox && (
              <Map
                polylines={myPolylines}
                markers={allMarkers}
              />
            )}
            
            {/* Inbox component with animation */}
            <AnimatePresence>
              {showInbox && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 20 }}
                  className="absolute right-0 top-0 h-full w-full bg-white shadow-lg z-50 overflow-y-auto motion-container"
                >
                  <InboxComponent 
                    onClose={() => setShowInbox(false)}
                    setNotification={setNotification}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {notification && (
        <Notification
          type={notification.type}
          text={notification.text}
          key={notification.key}
          onClose={() => setNotification(null)}
        />
      )}
    </PageTemplate>
  );
}

export default Trips;