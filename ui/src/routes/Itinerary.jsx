import React, { useState, useEffect, useRef } from "react";
import { axiosPlace, axiosInstance, axiosUser } from "../utils/axiosInstance";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import PageTemplate from "../components/PageTemplate";
import VoyageLogo from "../assets/voyage-complete-logo-navy.png";
import { motion, AnimatePresence } from "framer-motion";
import Map from "../components/Map";
import PlaceDetailSidebar from "../components/PlaceDetailSidebar";
import { axiosRecommendation } from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import PreferencesSidebar from "../components/PreferencesSidebar";
import PreferencesButton from "../components/PreferencesButton";
import { supabase } from "../utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer } from "react-toastify";
import ActivityList from "../components/ActivityList";
import DaySelector from "../components/DaySelector";
import ItineraryHeader from "../components/ItineraryHeader";
import { useCursorTracking } from "../hooks/useCursorTracking";
import { useTripData } from "../hooks/useTripData";
import { usePhotoManagement } from "../hooks/usePhotoManagement";
import { useNotifications } from "../hooks/useNotifications";
import { useActivityOperations } from "../hooks/useActivityOperations";

function Itinerary() {
  // Check if the user is authenticated
  const { isAuthenticated, LoggedUser } = useAuth();
  const pageRef = useRef(null);
  const location = useLocation();
  const { tripId } = useParams();
  const navigate = useNavigate();

  // Use the photo management hook
  const { photoCache, getPhotoUrl } = usePhotoManagement();

  // Use the trip data hook
  const { tripData, actions } = useTripData(tripId, getPhotoUrl);
  const {
    itinerary,
    title,
    totalDays,
    price_range,
    locationName,
    calendar,
    days,
    loading,
    routes,
    markers,
    tripType,
    stops,
    distancePill,
  } = tripData;
  // State for UI elements
  const [selectedDay, setSelectedDay] = useState(0);
  // State to track which days are open
  const [openDays, setOpenDays] = useState({});
  // State for preferences sidebar
  const [isPreferencesSidebarOpen, setIsPreferencesSidebarOpen] =
    useState(false);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);

  // Cursor tracking state
  const {
    otherCursors,
    cursorClicks,
    hasActiveCollaborators,
    updateCursorPosition,
    handleCursorClick,
  } = useCursorTracking({
    tripId,
    isAuthenticated,
    LoggedUser,
  });

  // State for export dropdown
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  const { showNotification } = useNotifications();

  const {
    refreshingActivity: activityOperationsRefreshingActivity,
    handleRefreshActivity,
    handleDeleteActivity,
    lastUpdateTimestamp: activityOperationsLastUpdateTimestamp,
  } = useActivityOperations({
    tripId,
    actions,
    showNotification,
  });

  // State for participants count
  const [totalPeople, setTotalPeople] = useState(0);

  // Fetch participants count for this trip
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!tripId) return;
      try {
        const res = await axiosUser.get(`/trips/participants/${tripId}`);
        if (Array.isArray(res.data)) {
          setTotalPeople(res.data.length);
        } else {
          setTotalPeople(0);
        }
      } catch (e) {
        setTotalPeople(0);
      }
    };
    fetchParticipants();
  }, [tripId]);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isPlaceSidebarOpen, setIsPlaceSidebarOpen] = useState(false);
  const [savingPlace, setSavingPlace] = useState(false);

  useEffect(() => {
    if (!loading && itinerary && itinerary.days && itinerary.days.length > 0) {
      if (Object.keys(openDays).length === 0) {
        setOpenDays({ 0: true });
      }
    }
  }, [loading, itinerary]);

  const handleSelectedDay = (dayIndex) => {
    setSelectedDay(dayIndex);
  };

  const handlePreferencesUpdated = async (newItineraryData) => {
    try {
      console.log("Received updated itinerary data:", newItineraryData);
      await actions.processItineraryData(newItineraryData);
      // Show some kind of success notification if desired
    } catch (error) {
      console.error("Error processing updated itinerary:", error);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSaveTrip = async () => {
    try {
      if (!isAuthenticated) {
        console.error("User is not authenticated");
        showNotification(
          "error",
          "You need to be LogIn to save the itinerary."
        );
        return;
      }
      // Try to get is_group from itinerary or localStorage
      let isGroup = false;
      if (typeof itinerary.is_group !== "undefined") {
        isGroup = itinerary.is_group;
      } else {
        isGroup = localStorage.getItem("isGroup") === "true";
      }
      const trip_management_response = await axiosInstance.post("/save", {
        id: tripId,
        itinerary: {
          ...itinerary,
          country: itinerary.country,
          city: itinerary.city,
          is_group: isGroup, // ensure is_group is present inside itinerary too
        },
        trip_type: tripType,
        is_group: isGroup, // <-- ensure is_group is present at the root
      });

      if (trip_management_response.status === 200) {
        console.log("Trip saved successfully in trip-management");
        showNotification("success", trip_management_response.data.message);

        // Set the timestamp of this update
        const updateTimestamp = new Date().toISOString();
        setLastUpdateTimestamp(updateTimestamp);

        // Broadcast the update to other users with user ID
        await supabase.channel(`trip-${tripId}`).send({
          type: "broadcast",
          event: "trip-update",
          payload: {
            tripId: tripId,
            timestamp: updateTimestamp,
            userId: LoggedUser?.id,
          },
        });
      }
    } catch (error) {
      console.error("Error saving trip:", error);
      showNotification("info", "Are you sure you are logged in?");
    }
  };

  const generateGoogleMapsUrl = (dayIndex) => {
    const waypoints = [];
    let origin = null;
    let destination = null;
    if (tripType == "road") {
      origin = `${stops[0].place.location.latitude},${stops[0].place.location.longitude}`;
      destination = `${stops[stops.length - 1].place.location.latitude},${
        stops[stops.length - 1].place.location.longitude
      }`;
      for (const stop of stops.slice(1, -1)) {
        waypoints.push(
          `${stop.place.location.latitude},${stop.place.location.longitude}`
        );
      }
      console.log(origin);
      console.log(destination);
      console.log(waypoints);
    } else {
      if (!itinerary.days || !itinerary.days[dayIndex]) return null;

      const day = itinerary.days[dayIndex];

      // Process morning activities
      if (day.morning_activities && day.morning_activities.length > 0) {
        const firstActivity = day.morning_activities[0];
        if (firstActivity.place.location) {
          origin = `${firstActivity.place.location.latitude},${firstActivity.place.location.longitude}`;
        }

        // Add remaining morning activities as waypoints
        day.morning_activities.slice(1).forEach((activity) => {
          if (activity.place.location) {
            waypoints.push(
              `${activity.place.location.latitude},${activity.place.location.longitude}`
            );
          }
        });
      }

      // Process afternoon activities
      if (day.afternoon_activities && day.afternoon_activities.length > 0) {
        day.afternoon_activities.forEach((activity) => {
          if (activity.place.location) {
            if (!origin) {
              origin = `${activity.place.location.latitude},${activity.place.location.longitude}`;
            } else {
              waypoints.push(
                `${activity.place.location.latitude},${activity.place.location.longitude}`
              );
            }
          }
        });

        // Set the last activity as destination
        const lastActivity =
          day.afternoon_activities[day.afternoon_activities.length - 1];
        if (lastActivity.place.location) {
          destination = `${lastActivity.place.location.latitude},${lastActivity.place.location.longitude}`;
        }
      }
    }

    if (!origin || !destination) return null;

    const waypointsStr =
      waypoints.length > 0 ? `&waypoints=${waypoints.join("|")}` : "";
    console.log(waypointsStr);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsStr}&travelmode=driving`;
  };

  const handleOpenInGoogleMaps = (dayIndex) => {
    const url = generateGoogleMapsUrl(dayIndex);
    if (url) {
      window.open(url, "_blank");
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target)
      ) {
        setExportDropdownOpen(false);
      }
    }
    if (exportDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportDropdownOpen]);

  const handlePlaceClick = async (place, displayOrder = 1) => {
    try {
      // Fetch place details from backend
      const response = await axiosPlace.get(`/places/${place.id}`);
      const placeDetails = response.data;
      
      let isSaved = false;
      
      // Check if this place is saved by the user
      if (isAuthenticated && placeDetails.place_id) {
        try {
          const savedResponse = await axiosUser.get('/places/user/favorite/check', { 
            params: { place_id: placeDetails.place_id } 
          });
          isSaved = savedResponse.data?.is_saved || false;
        } catch (error) {
          console.error("Error checking if place is saved:", error);
        }
      }
      
      // Format the place data for the sidebar
      const formattedPlaceData = {
        id: placeDetails.place_id,
        name: placeDetails.name,
        description: placeDetails.description,
        address: placeDetails.address,
        phone: placeDetails.phone_number,
        rating: placeDetails.rating,
        location: place.location,
        photos: placeDetails.photos,
        latitude: placeDetails.location?.latitude,
        longitude: placeDetails.location?.longitude,
        openHours: placeDetails.opening_hours?.periods || [],
        reviews: placeDetails.reviews || [],
        isSaved: isSaved,
        displayOrder: displayOrder
      };
      
      setSelectedPlace(formattedPlaceData);
      setIsPlaceSidebarOpen(true);
    } catch (error) {
      console.error("Error fetching place details:", error);
      
      // For fallback, also try to check if this place is saved
      let isSaved = false;
      if (isAuthenticated && place.id) {
        try {
          const savedResponse = await axiosUser.get('/places/user/favorite/check', { 
            params: { place_id: place.id } 
          });
          isSaved = savedResponse.data?.is_saved || false;
        } catch (err) {
          console.error("Error checking if place is saved:", err);
        }
      }
      
      // Fallback to basic data if fetch fails
      setSelectedPlace({
        id: place.id,
        name: place.place,
        location: place.location,
        image: place.image,
        isSaved: isSaved,
        displayOrder: displayOrder
      });
      setIsPlaceSidebarOpen(true);
    }
  };

  const handleToggleSave = async (placeId) => {
    if (!isAuthenticated) {
      showNotification("error", "You need to be logged in to save places");
      return;
    }

    if (!placeId) {
      console.error("No place ID provided");
      return;
    }

    setSavingPlace(true);
    
    try {
      // Get current saved status from the selected place
      const isSaved = selectedPlace?.isSaved || false;
      
      if (isSaved) {
        // Remove from favorites
        await axiosUser.delete('/places/user/favorite', { 
          data: { place_id: placeId } 
        });
        
        showNotification("success", "Place removed from saved places");
      } else {
        // Add to favorites
        await axiosUser.post('/places/user/favorite', { 
          place_id: placeId 
        });
        
        showNotification("success", "Place added to saved places");
      }
      
      // Update the selected place's saved status
      if (selectedPlace && selectedPlace.id === placeId) {
        setSelectedPlace(prev => ({
          ...prev,
          isSaved: !isSaved
        }));
      }
    } catch (error) {
      console.error("Error toggling place save:", error);
      showNotification("error", "Failed to update saved places");
    } finally {
      setSavingPlace(false);
    }
  };

  return (
    <PageTemplate>
      <PreferencesSidebar
        isOpen={isPreferencesSidebarOpen}
        onClose={() => setIsPreferencesSidebarOpen(false)}
        tripId={tripId}
        onPreferencesUpdated={handlePreferencesUpdated}
      />


      <div
        ref={pageRef}
        className="flex flex-col relative w-full"
        onMouseMove={(e) => updateCursorPosition(e, pageRef)}
        onClick={(e) => handleCursorClick(e, pageRef)}
      >
        <div className="flex justify-center items-center flex-col w-full px-4 pt-2">
          <div className="mb-4">
            <img
              src={VoyageLogo}
              alt="Voyage Logo"
              className="h-30 cursor-pointer"
              onClick={handleLogoClick}
            />
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
        />

        {/* Other users' cursors */}
        {Object.values(otherCursors)
          .reduce((unique, cursor) => {
            const existing = unique.find((c) => c.user_id === cursor.user_id);
            if (!existing || existing.lastUpdate < cursor.lastUpdate) {
              const filtered = unique.filter(
                (c) => c.user_id !== cursor.user_id
              );
              return [...filtered, cursor];
            }
            return unique;
          }, [])
          .map((cursor) => (
            <div
              key={cursor.id}
              className="absolute pointer-events-none z-50"
              style={{
                left: `${cursor.x}%`,
                top: `${cursor.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-5 h-5 flex items-center justify-center"
                  style={{
                    color: `hsl(${
                      parseInt(cursor.id.substring(0, 8), 16) % 360
                    }, 80%, 60%)`,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M0,0 L0,12 L3,9.5 L5,13 L8,11 L6,7.5 L10,7 L0,0"></path>
                  </svg>
                </div>
                <div className="text-xs bg-gray-800 text-white px-2 py-1 rounded-md whitespace-nowrap">
                  {cursor.user_name}
                </div>
              </div>
            </div>
          ))}

        {/* Click animations - only show other users' clicks */}
        {Object.entries(cursorClicks).map(([id, click]) => (
          <div
            key={`click-${id}-${click.timestamp}`}
            className="absolute pointer-events-none z-40 w-8 h-8 rounded-full"
            style={{
              left: `${click.x}%`,
              top: `${click.y}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: `hsl(${
                parseInt(id.substring(0, 8), 16) % 360
              }, 80%, 80%)`,
              opacity: 0,
              animation: "cursorClick 800ms ease-out",
            }}
          />
        ))}

        <div className="flex flex-col md:flex-row h-min-screen p-10 -mt-10">
          {/* Left Side */}
          <div className="w-full md:w-1/2 pr-4 overflow-visible relative z-40">
            <ItineraryHeader
              title={title}
              totalDays={totalDays}
              totalPeople={totalPeople}
              locationName={locationName}
              distancePill={distancePill}
              priceRange={price_range}
              tripType={tripType}
              onSaveTrip={handleSaveTrip}
              onOpenInGoogleMaps={handleOpenInGoogleMaps}
              onPreferencesClick={() => setIsPreferencesSidebarOpen(true)}
              tripId={tripId}
              itinerary={itinerary}
              exportDropdownOpen={exportDropdownOpen}
              setExportDropdownOpen={setExportDropdownOpen}
              generateGoogleMapsUrl={generateGoogleMapsUrl}
              participants={tripData.participants}
              className="z-40"
            />

            <div className="h-[40rem] pr-2">
              {tripType !== "road" && (
                <DaySelector
                  days={days}
                  calendar={calendar}
                  selectedDay={selectedDay}
                  onDaySelect={handleSelectedDay}
                  limitDays={5}
                />
              )}
              <div className="w-full rounded-b-2xl h-4/5 p-3">
                <ActivityList
                  key={selectedDay}
                  days={days}
                  selectedDay={selectedDay}
                  loading={loading}
                  refreshingActivity={activityOperationsRefreshingActivity}
                  photoCache={photoCache}
                  getPhotoUrl={getPhotoUrl}
                  onRefreshActivity={handleRefreshActivity}
                  onDeleteActivity={handleDeleteActivity}
                  tripType={tripType}
                  stops={stops}
                  participants={tripData.participants}
                  onPlaceClick={handlePlaceClick}
                />
              </div>
            </div>
          </div>
          {/* Right Side */}
          <div className="w-full md:w-1/2 bg-blue-100 flex items-center justify-center overflow-hidden text-gray-500 rounded-lg max-h-full relative z-20">
            {!isPlaceSidebarOpen && (
              <Map
                polylines={tripType !== "road" ? routes[selectedDay] : routes}
                markers={tripType !== "road" ? markers[selectedDay] : markers}
                className="z-20"
              />
            )}
            <PlaceDetailSidebar
              place={selectedPlace}
              isOpen={isPlaceSidebarOpen}
              onClose={() => setIsPlaceSidebarOpen(false)}
              onToggleSave={handleToggleSave}
              savingState={savingPlace}
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default Itinerary;
