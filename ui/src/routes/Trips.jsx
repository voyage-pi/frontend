import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import PageTemplate from "../components/PageTemplate";
import TripCard from "../components/TripCard";
import SearchHeader from "../components/SearchBar";
import TabBar from "../components/TabBar";
import MapComponent from "../components/Map";
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
  const fetchingTripsRef = useRef(false);
  const navigate = useNavigate();
  const { LoggedUser, isAuthenticated, isUserLoading } = useAuth();
  const { userTag } = useParams(); // Get userTag from URL params

  // Determine if we're viewing our own trips or someone else's
  const [viewingUser, setViewingUser] = useState(null);
  const isViewingOwnTrips = !userTag || (LoggedUser && userTag === LoggedUser.tag);

  const { totalCount, addTripInvite, tripInviteCount, refreshNotifications } = useNotifications();

  useEffect(() => {
    // Fetch notifications when Inbox opens
    refreshNotifications();
    // Only run on mount
    // eslint-disable-next-line
  }, []);

  // If userTag is provided but doesn't match LoggedUser, fetch that user's info
  useEffect(() => {
    const fetchUserByTag = async () => {
      if (userTag && (!LoggedUser || userTag !== LoggedUser.tag)) {
        try {
          // Fetch user info by tag
          const response = await axiosUser.get(`/user/tag/${userTag}`);
          if (response.data && response.data.response) {
            setViewingUser(response.data.response);
          }
        } catch (error) {
          console.error("Error fetching user by tag:", error);
          if (error.response && error.response.status === 404) {
            navigate('/not-found');
          } else {
            setNotification({
              message: "Error loading user profile. Please try again later.",
              type: "error"
            });
          }
        }
      } else if (LoggedUser) {
        // Only set viewingUser to LoggedUser if it's not already set to prevent extra renders
        if (!viewingUser || viewingUser.id !== LoggedUser.id) {
          console.log("Setting viewingUser to LoggedUser");
          setViewingUser(LoggedUser);
        }
      }
    };

    if (!isUserLoading) {
      fetchUserByTag();
    }
  }, [userTag, LoggedUser, isUserLoading, navigate, viewingUser]);

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
      // Prevent duplicate fetches while one is in progress
      if (fetchingTripsRef.current) {
        console.log('Trip fetch already in progress, skipping');
        return;
      }

      try {
        fetchingTripsRef.current = true;
        setLoading(true);

        // Determine which user's trips to fetch
        const userToFetch = viewingUser || LoggedUser;

        // Check if we have a user to fetch trips for
        if (!userToFetch) {
          console.log('No user to fetch trips for');
          setTrips([]);
          setLoading(false);
          return;
        }

        let userTrips = [];

        try {
          // Different approach based on whether viewing own trips or someone else's
          const myTripsResponse = await axiosUser.get(`/trip-info/trips/${userToFetch.id}`);
          
          // The trip_ids are actually inside data.data.trip_ids
          if (myTripsResponse.data && myTripsResponse.data.data && myTripsResponse.data.data.trip_ids) {
            
            // Create user trips objects from the trip_ids array
            userTrips = myTripsResponse.data.data.trip_ids.map(tripId => {
              // Ensure tripId is a string
              if (tripId === null || tripId === undefined) {
                console.warn('Found null or undefined trip ID in response');
                return null;
              }
              
              return {
                trip_id: String(tripId), // Ensure it's a string
                status: 'owner' // Default status, can be updated if you have status data
              };
            }).filter(trip => trip !== null); // Remove any null entries
            
          } else {
            console.log('No trip_ids found in response');
            userTrips = [];
          }
        } catch (fetchError) {
          console.error('Error fetching user trips list:', fetchError);
          setNotification({
            message: "Could not load trips. Please try again later.",
            type: "error"
          });
          setTrips([]);
          setLoading(false);
          return;
        }

        if (!userTrips || !userTrips.length) {
          console.log('No trips found for user');
          setTrips([]);
          setLoading(false);
          return;
        }

        // Fetch trip details for each trip
        const tripDetailsPromises = userTrips.map(async (userTrip) => {
          try {
            if (!userTrip || !userTrip.trip_id) {
              console.error('Invalid user trip data:', userTrip);
              return null;
            }
            
            const tripId = userTrip.trip_id;
            console.log(`Fetching trip details for trip ID: ${tripId}`);
            
            // Make sure tripId is a valid format before fetching
            if (!tripId || typeof tripId !== 'string' || tripId.trim() === '') {
              console.error('Invalid trip ID format:', tripId);
              return null;
            }
            
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
              // The response structure follows the ResponseBody format with nested itinerary
              if (tripResponse.data && tripResponse.data.response && tripResponse.data.response.itinerary) {
                const itinerary = tripResponse.data.response.itinerary;
                
                // Fetch the photo URL
                const imageUrl = await getFirstPhotoUrl(itinerary);
                
                // Extract location data based on trip type
                let locationData = {};
                
                if (itinerary.trip_type === 'zone' && itinerary.original_place_data?.center) {
                  // For zone trips, use the center location
                  locationData = {
                    location: {
                      latitude: itinerary.original_place_data.center.latitude,
                      longitude: itinerary.original_place_data.center.longitude
                    }
                  };
                } else if (itinerary.trip_type === 'zone' && itinerary.center_coordinates) {
                  // Fallback for zone trips without original_place_data
                  locationData = {
                    location: {
                      latitude: itinerary.center_coordinates.latitude,
                      longitude: itinerary.center_coordinates.longitude
                    }
                  };
                } else if (itinerary.trip_type === 'place' && itinerary.original_place_data?.coordinates) {
                  // For place trips, use the coordinates
                  locationData = {
                    location: {
                      latitude: itinerary.original_place_data.coordinates.latitude,
                      longitude: itinerary.original_place_data.coordinates.longitude
                    }
                  };
                } else if (itinerary.trip_type === 'place' && itinerary.place_coordinates) {
                  // Fallback for place trips without original_place_data
                  locationData = {
                    location: {
                      latitude: itinerary.place_coordinates.latitude,
                      longitude: itinerary.place_coordinates.longitude
                    }
                  };
                } else if (itinerary.trip_type === 'road' && itinerary.original_place_data?.origin && itinerary.original_place_data?.destination) {
                  // For road trips, use a consistent structure with a primary location (origin) and additional destination info
                  locationData = {
                    location: {
                      latitude: itinerary.original_place_data.origin.location.latitude,
                      longitude: itinerary.original_place_data.origin.location.longitude
                    },
                    location_origin: {
                      latitude: itinerary.original_place_data.origin.location.latitude,
                      longitude: itinerary.original_place_data.origin.location.longitude,
                      name: itinerary.original_place_data.origin.name
                    },
                    location_destination: {
                      latitude: itinerary.original_place_data.destination.location.latitude,
                      longitude: itinerary.original_place_data.destination.location.longitude,
                      name: itinerary.original_place_data.destination.name
                    }
                  };
                } else if (itinerary.trip_type === 'road' && itinerary.origin_coordinates && itinerary.destination_coordinates) {
                  // Fallback for road trips without original_place_data
                  locationData = {
                    location: {
                      latitude: itinerary.origin_coordinates.latitude,
                      longitude: itinerary.origin_coordinates.longitude
                    },
                    location_origin: {
                      latitude: itinerary.origin_coordinates.latitude,
                      longitude: itinerary.origin_coordinates.longitude,
                      name: 'Origin'
                    },
                    location_destination: {
                      latitude: itinerary.destination_coordinates.latitude,
                      longitude: itinerary.destination_coordinates.longitude,
                      name: 'Destination'
                    }
                  };
                } else {
                  
                  // Fallback: Extract location from first activity
                  if (itinerary.days && itinerary.days.length > 0) {
                    const firstDay = itinerary.days[0];
                    for (const timeSlot of ['morning_activities', 'afternoon_activities', 'evening_activities']) {
                      if (firstDay[timeSlot] && firstDay[timeSlot].length > 0) {
                        const firstActivity = firstDay[timeSlot][0];
                        if (firstActivity && firstActivity.place && firstActivity.place.location) {
                          console.log(`Found location in ${timeSlot}:`, firstActivity.place.location);
                          locationData = {
                            location: {
                              latitude: firstActivity.place.location.latitude,
                              longitude: firstActivity.place.location.longitude
                            }
                          };
                          break;
                        }
                      }
                    }
                  }
                  
                  if (!locationData.location) {
                    console.log(`No location data could be extracted for trip ${tripId}`);
                  }
                }
                
                return {
                  id: tripId,
                  name: itinerary.name || 'Unnamed Trip',
                  type: itinerary.trip_type,
                  date: formatTripDates(itinerary.start_date, itinerary.end_date),
                  days: itinerary.days ? itinerary.days.length : 0,
                  people: peopleCount, // Use fetched people count
                  status: userTrip.status, // This comes directly from user_trips
                  destinations: getDestinationsCount(itinerary),
                  image: imageUrl,
                  markers: extractMarkers(itinerary),
                  ...locationData // Add location data to the trip object
                };
              } else {
                console.error('Invalid trip response structure:', tripResponse.data);
                return null;
              }
            } catch (tripError) {
              console.error(`Error fetching trip ${tripId}:`, tripError);
              // Create a placeholder trip with minimal data when details fetch fails
              return {
                id: tripId,
                name: 'Trip data unavailable',
                date: 'Unknown dates',
                days: 0,
                people: 0,
                status: userTrip.status,
                destinations: 0,
                image: generatePlaceholderImage('error-trip'),
                markers: []
              };
            }
          } catch (error) {
            console.error(`Error processing trip:`, error);
            return null;
          }
        });

        const tripDetails = await Promise.all(tripDetailsPromises);
        const validTrips = tripDetails.filter(trip => trip !== null);
        console.log('Processed trips:', validTrips);
        setTrips(validTrips);
      } catch (error) {
        console.error("Error fetching user trips:", error);
        setTrips([]);
        setNotification({
          message: "Failed to load trips. Please try refreshing the page.",
          type: "error"
        });
      } finally {
        setLoading(false);
        fetchingTripsRef.current = false;
      }
    };

    // Only fetch trips when we have a user to fetch for
    if (!isUserLoading && (viewingUser || LoggedUser)) {
      console.log("Triggering trip fetch - dependencies changed");
      fetchTrips();
    }
  }, [viewingUser, LoggedUser, isUserLoading]); // Removed isViewingOwnTrips dependency

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

  // Extract markers for the map (legacy function, kept for compatibility)
  const extractMarkers = (itinerary) => {
    try {
      const markers = [];

      if (itinerary.trip_type === 'zone' && itinerary.original_place_data?.center) {
        markers.push({
          position: {
            lat: itinerary.original_place_data.center.latitude,
            lng: itinerary.original_place_data.center.longitude
          },
          title: itinerary.name
        });
      } else if (itinerary.trip_type === 'place' && itinerary.original_place_data?.coordinates) {
        markers.push({
          position: {
            lat: itinerary.original_place_data.coordinates.latitude,
            lng: itinerary.original_place_data.coordinates.longitude
          },
          title: itinerary.name
        });
      } else if (itinerary.trip_type === 'road' && itinerary.original_place_data?.origin && itinerary.original_place_data?.destination) {
        markers.push({
          position: {
            lat: itinerary.original_place_data.origin.location.latitude,
            lng: itinerary.original_place_data.origin.location.longitude
          },
          title: itinerary.original_place_data.origin.name
        });
        markers.push({
          position: {
            lat: itinerary.original_place_data.destination.location.latitude,
            lng: itinerary.original_place_data.destination.location.longitude
          },
          title: itinerary.original_place_data.destination.name
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

  // Generate city-based markers from trip locations
  const getCityMarkers = () => {
    const uniqueLocations = new Map(); // Use Map to avoid duplicate cities
    
    // First, assign each trip a unique number
    const tripNumbers = new Map();
    filteredTrips.forEach((trip, index) => {
      tripNumbers.set(trip.id, index + 1);
    });
    
    
    filteredTrips.forEach(trip => {
      const tripNumber = tripNumbers.get(trip.id);
      
      // Handle all trip types that have a primary location (zone, place, and now road trips)
      if (trip.location && trip.location.latitude && trip.location.longitude) {
        const locationKey = `${trip.location.latitude},${trip.location.longitude}`;
        if (!uniqueLocations.has(locationKey)) {
          uniqueLocations.set(locationKey, {
            position: {
              lat: trip.location.latitude,
              lng: trip.location.longitude
            },
            title: trip.name,
            tripCount: 1,
            tripIds: [trip.id],
            tripNumbers: [tripNumber],
            displayNumber: tripNumber, // Use the trip number for display
            image: trip.image
          });
        } else {
          // If location already exists, increment trip count
          const existing = uniqueLocations.get(locationKey);
          existing.tripCount += 1;
          existing.tripIds.push(trip.id);
          existing.tripNumbers.push(tripNumber);
          // For multiple trips at same location, show the first trip's number
          existing.displayNumber = existing.tripNumbers[0];
          // Update title to show multiple trips
          existing.title = `${existing.tripCount} trips in this area`;
        }
      } else {
        console.log(`No valid primary location found for trip ${trip.id}:`, trip.location);
      }
      
      // For road trips, also add the destination as a separate marker
      if (trip.type === 'road' && trip.location_destination && trip.location_destination.latitude && trip.location_destination.longitude) {
        const destKey = `${trip.location_destination.latitude},${trip.location_destination.longitude}`;
        
        if (!uniqueLocations.has(destKey)) {
          uniqueLocations.set(destKey, {
            position: {
              lat: trip.location_destination.latitude,
              lng: trip.location_destination.longitude
            },
            title: trip.location_destination.name || `${trip.name} (Destination)`,
            tripCount: 1,
            tripIds: [trip.id],
            tripNumbers: [tripNumber],
            displayNumber: tripNumber, // Same trip number as origin
            image: trip.image
          });
        } else {
          const existing = uniqueLocations.get(destKey);
          existing.tripCount += 1;
          existing.tripIds.push(trip.id);
          existing.tripNumbers.push(tripNumber);
          // For multiple trips at same location, show the first trip's number
          existing.displayNumber = existing.tripNumbers[0];
          existing.title = `${existing.tripCount} trips to this area`;
        }
      } else if (trip.type === 'road') {
        console.log(`Road trip ${trip.id} missing valid location_destination:`, trip.location_destination);
      }
    });
    
    const markers = Array.from(uniqueLocations.values());
    return markers;
  };

  // Create a mapping from trip ID to trip number
  const getTripToMarkerMapping = () => {
    const tripToMarkerMap = new Map();
    
    filteredTrips.forEach((trip, index) => {
      tripToMarkerMap.set(trip.id, index + 1);
    });
    
    return tripToMarkerMap;
  };

  const allMarkers = getCityMarkers();
  const tripToMarkerMap = getTripToMarkerMapping();

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
            <div className="px-6 pt-4 overflow-y-auto h-[calc(100vh-180px)] relative">
              <div className="mb-4">
                <SearchHeader
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onCreateNew={handleCreateTrip}
                  createButtonText="New Trip"
                  placeholder="Search..."
                />
              </div>

              {isUserLoading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Loading user information...</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Please log in to view your trips.</p>
                </div>
              ) : loading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Loading trips...</p>
                </div>
              ) : filteredTrips.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No trips found.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-x-8 gap-y-4 pb-8 overflow-visible justify-start items-center">
                  {filteredTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      id={trip.id}
                      image={trip.image}
                      days={trip.days}
                      people={trip.people}
                      destinations={trip.destinations}
                      type={trip.type} 
                      name={trip.name}
                      date={trip.date}
                      markerNumber={tripToMarkerMap.get(trip.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-3/7 h-screen relative">
            {/* Map component */}
            {!showInbox && (
              <MapComponent
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