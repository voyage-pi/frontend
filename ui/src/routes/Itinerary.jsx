import React, { useState, useEffect } from "react";
import { axiosPlace,axiosInstance,axiosUser } from "../utils/axiosInstance";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import PageTemplate from "../components/PageTemplate";
import VoyageLogo from "../assets/voyage-complete-logo-navy.png";
import { GoPeople, GoClock } from "react-icons/go";
import { IoLocationOutline } from "react-icons/io5";
import Map from "../components/Map";
import { motion, AnimatePresence } from "framer-motion";
import PlaceCard from "../components/PlaceCard";
import { FaRegFloppyDisk } from "react-icons/fa6";
import { HiOutlineTrash } from "react-icons/hi2";
import { axiosRecommendation } from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Notification from "../components/Notification";
import { ToastContainer } from "react-toastify";
import PreferencesSidebar from "../components/PreferencesSidebar";
import PreferencesButton from "../components/PreferencesButton";

function Itinerary() {
  // Check if the user is authenticated
  const { isAuthenticated } = useAuth();

  const [itinerary, setItinerary] = useState({});
  const [title, setTitle] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [totalPeople, setTotalPeople] = useState(0);
  const [budget, setBudget] = useState(0);
  const [locationName, setLocation] = useState("");
  const [calendar, setCalendar] = useState([]);
  const [days, setDays] = useState({});
  const location = useLocation();
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [notification, setNotification] = useState(null);
  // State to track which days are open
  const [openDays, setOpenDays] = useState({});
  // Cache for photo URLs
  const [photoCache, setPhotoCache] = useState({});
  const [refreshingActivity, setRefreshingActivity] = useState(null);
  // State for preferences sidebar
  const [isPreferencesSidebarOpen, setIsPreferencesSidebarOpen] = useState(false);

  useEffect(() => {
    if (location.state?.itineraryData) {
      // Use data passed from Forms component
      const responseData = location.state.itineraryData;
      console.log("Received itinerary data from Forms:", responseData);
      
      // Save user ratings when coming from the form
      if (location.state.userRatings) {
        localStorage.setItem("userRatings", JSON.stringify(location.state.userRatings));
        console.log("Saved user ratings to localStorage:", location.state.userRatings);
      }
      
      processItineraryData(responseData);
    } else if (tripId) {
      // Fetch itinerary data using the trip ID
      fetch(`/api/v1/trip-management/api/trips/${tripId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Loaded itinerary data from API:", data);
          
          // Check if we need to load user ratings from API
          if (data.questions && data.questions.user123) {
            const userQuestions = data.questions.user123;
            const ratings = userQuestions.map(q => q.value);
            if (ratings.length > 0) {
              localStorage.setItem("userRatings", JSON.stringify(ratings));
              console.log("Loaded user ratings from API:", ratings);
            }
          }
          
          processItineraryData(data);
        })
        .catch((error) => console.error("Error loading itinerary:", error));
    } else {
      // Fallback to fetching from JSON file if no state data exists
      fetch("/trip_management_resp.json")
        .then((response) => response.json())
        .then((data) => {
          console.log("Loaded itinerary data from JSON file:", data);
          processItineraryData(data);
        })
        .catch((error) => console.error("Error loading itinerary:", error));
    }
  }, [location, tripId]);

  useEffect(() => {
    // Initialize first day as open when itinerary is loaded
    if (!loading && itinerary.calendar) {
      const days = Object.keys(itinerary.calendar);
      if (days.length > 0) {
        // Initialize with first day open
        setOpenDays((prevState) => ({
          ...prevState,
          [days[0]]: true,
        }));
      }
    }
  }, [loading, itinerary.calendar]);

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
      console.log(response);
      if (response.status == 429) {
        return getPhotoUrl(place);
      }
      const photoUrl = response.data?.uri;
      setPhotoCache((prev) => ({
        [placeId]: photoUrl,
      }));

      return photoUrl;
    } catch (error) {
      console.error("Error fetching photo:", error);
      return generatePlaceholderImage(place.name);
    }
  };

  // Helper function for placeholders as a fallback
  const generatePlaceholderImage = (seed) => {
    const seedStr = typeof seed === "string" ? seed : "place";
    const cleanSeed = seedStr.replace(/[^a-zA-Z0-9]/g, "");
    return `https://picsum.photos/seed/${encodeURIComponent(
      cleanSeed
    )}/400/300`;
  };

  const processItineraryData = async (data) => {
    if (data.response && data.response.itinerary) {
      const responseItinerary = data.response.itinerary;
      console.log("Processing itinerary data:", responseItinerary);
      setItinerary(responseItinerary);
      console.log("itinerary", responseItinerary);
      const calendar = [];
      const AllroutesData = [];
      const AllmarkersData = [];
      const imagePromises = [];

      if (responseItinerary.days) {
        setDays(responseItinerary.days);
        for (const day of responseItinerary.days) {
          const dayActivities = [];
          const routesData = [];
          const markersData = [];

          if (day.morning_activities) {
            for (const activity of day.morning_activities) {
              const photoPromise = getPhotoUrl(activity.place).then(
                (imageUrl) => {
                  dayActivities.push({
                    id: activity.id,
                    place: activity.place.name,
                    time: `${formatTime(activity.start_time)} - ${formatTime(
                      activity.end_time
                    )}`,
                    image: imageUrl,
                    transport: activity.transport || {},
                  });

                  if (activity.place.location) {
                    markersData.push({
                      position: {
                        lat: activity.place.location.latitude,
                        lng: activity.place.location.longitude,
                      },
                      title: activity.place.name,
                      address: activity.place.name,
                      image: imageUrl,
                    });
                  }
                }
              );

              imagePromises.push(photoPromise);
            }
          }

          if (day.afternoon_activities) {
            for (const activity of day.afternoon_activities) {
              const photoPromise = getPhotoUrl(activity.place).then(
                (imageUrl) => {
                  dayActivities.push({
                    id: activity.id,
                    place: activity.place.name,
                    time: `${formatTime(activity.start_time)} - ${formatTime(
                      activity.end_time
                    )}`,
                    image: imageUrl,
                    transport: activity.transport || {},
                  });

                  if (activity.place.location) {
                    markersData.push({
                      position: {
                        lat: activity.place.location.latitude,
                        lng: activity.place.location.longitude,
                      },
                      title: activity.place.name,
                      address: activity.place.name,
                      image: imageUrl,
                    });
                  }
                }
              );

              imagePromises.push(photoPromise);
            }
          }

          // Add routes for this day
          if (day.routes && day.routes.length > 0) {
            routesData.push({
              polylines: day.routes.map((route) => ({
                polylineEncoded: route.polylineEncoded,
                duration: route.duration,
                distance: route.distance,
              })),
            });
          }

          calendar.push(dayActivities);
          AllroutesData.push(routesData);
          AllmarkersData.push(markersData);
        }
      }

      await Promise.all(imagePromises);

      const totalDays = responseItinerary.days
        ? responseItinerary.days.length
        : 0;

      let locationTrip = "...";
      if (
        totalDays > 0 &&
        responseItinerary.days[0].morning_activities &&
        responseItinerary.days[0].morning_activities.length > 0
      ) {
        locationTrip = responseItinerary.name;
      }

      setTitle(responseItinerary.name);
      setTotalDays(totalDays);
      setTotalPeople(responseItinerary.total_people || 1);
      setBudget(responseItinerary.budget || 0);
      setLocation(locationTrip);
      setCalendar(calendar);

      setRoutes(AllroutesData);
      setMarkers(AllmarkersData);
    }
    setLoading(false);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  console.log("itinerary", itinerary);
  console.log("openDays", openDays);
  const limitDays = 5;

  const handleSelectedDay = (dayIndex) => {
    console.log(routes);
    setSelectedDay(dayIndex);
    console.log(routes[selectedDay]);
  };

  const handleRefreshActivity = async (activityId) => {
    setRefreshingActivity(activityId);
    try {
      const response = await axiosRecommendation.post(
        `/trip/${tripId}/regenerate-activity`,
        {
          activityId: activityId,
        }
      );

      if (
        response.data &&
        response.data.response &&
        response.data.response.itinerary
      ) {
        const newItineraryData = response.data;
        await processItineraryData(newItineraryData);
      } else {
        console.error("Invalid response structure:", response.data);
      }
    } catch (error) {
      console.error("Error refreshing activity:", error);
    } finally {
      setRefreshingActivity(null);
    }
  };

  const handlePreferencesUpdated = async (newItineraryData) => {
    try {
      console.log("Received updated itinerary data:", newItineraryData);
      setLoading(true);
      await processItineraryData(newItineraryData);
      // Show some kind of success notification if desired
    } catch (error) {
      console.error("Error processing updated itinerary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSaveTrip = async () => {
    try {
      if (!isAuthenticated) {
        console.error("User is not authenticated");
        setNotification({
          type: "error",
          text: "You need to be LogIn to save the itinerary.",
          key: Date.now(),
        });
        return;
      }
      const trip_management_response = await axiosInstance.post("/save", {
        id: tripId,
        itinerary: itinerary,
      });
        
      if (trip_management_response.status === 200) {
        console.log("Trip saved successfully in trip-management");
        setNotification({
          type: "success",
          text: trip_management_response.data.message,
          key: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error saving trip:", error);
      setNotification({
        type: "info",
        text: "Are you sure you are logged in?",
        key: Date.now(),
      });
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
      
      <div className="flex justify-center items-center flex-col w-full px-4 pt-2 ">
        <div className="mb-4">
          <img 
            src={VoyageLogo} 
            alt="Voyage Logo" 
            className="h-30 cursor-pointer" 
            onClick={handleLogoClick}
          />
        </div>
      </div>

      <ToastContainer />

      {notification && (
        <Notification
          key={notification.key}
          type={notification.type}
          text={notification.text}
          onClose={() => setNotification(null)}
          options={{
            position: "top-right",
            autoClose: 3000,
            pauseOnHover: false,
          }}
        />
      )}
      <div className="flex flex-col md:flex-row h-min-screen p-10 -mt-10">
        {/* Left Side */}
        <div className="w-full md:w-1/2 pr-4 overflow-hidden  ">
          <div className="flex flex-row  mb-4 items-center gap-5">
            <h1 className="text-3xl font-bold">{title}</h1>
            {/* <div className="btn btn-md btn-primary rounded-full btn-circle shadow-sm">
              <CiSaveDown1 className="text-white text-2xl" />
            </div> */}
            <div
              className="btn btn-md btn-white rounded-full btn-circle shadow-sm"
              onClick={() => handleSaveTrip()}
            >
              <FaRegFloppyDisk className="text-primary text-xl" />
            </div>
          </div>

          <div className="flex flex-row items-center justify-between pb-5">
            <div className="flex flex-row gap-x-5">
              <div className="rounded-full border-1 border-secondary/10">
                <div className="flex flex-row items-center gap-x-3 m-1">
                  <GoClock className="text-primary ml-1" />
                  <div className="mr-2">
                    <span className="font-bold"> {totalDays} </span>
                    {totalDays === 1 ? "day" : "days"}
                  </div>
                </div>
              </div>

              <div className="rounded-full border-1 border-secondary/10">
                <div className="flex flex-row items-center gap-x-3 m-1">
                  <GoPeople className="text-primary ml-1" />
                  <div className="mr-2">
                    <span className="font-bold"> {totalPeople} </span>
                    {totalPeople === 1 ? "person" : "people"}
                  </div>
                </div>
              </div>
              {/* <div className="rounded-full border-1 border-secondary/10">
                <div className="flex flex-row items-center gap-x-3 m-1">
                  <TbMoneybag className="text-primary ml-1" />
                  <div className="mr-2">
                    <span className="font-bold"> {itinerary.budget} </span> €
                  </div>
                </div>
              </div> */}
              <div className="rounded-full border-1 border-secondary/10">
                <div className="flex flex-row items-center gap-x-3 m-1">
                  <IoLocationOutline className="text-primary ml-1" />
                  <div className="mr-2">
                    <span> {locationName} </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preferences Button - now inline with the tags */}
            <div className="pr-2">
              <PreferencesButton onClick={() => setIsPreferencesSidebarOpen(true)} />
            </div>
          </div>

          <div className="h-[40rem] pr-2">
            {loading ? (
              <div className="flex flex-col text-center justify-center p-3  ">
                <div className="w-full h-[100px] my-2 skeleton"></div>
                <div className="w-full h-[100px] my-2 skeleton"></div>
                <div className="w-full h-[100px] my-2 skeleton"></div>
              </div>
            ) : (
              <>
                <motion.div
                  className={`w-full flex p-4 h-1/8 py-5 ${
                    days.length > limitDays ? "" : "overflow-x-auto"
                  } `}
                >
                  {Object.keys(calendar).map((day, index) => (
                    <motion.div
                      initial={false}
                      animate={{
                        boxShadow:
                          selectedDay == index
                            ? "0px 0px 20px 3px rgba(0, 0, 0, 0.1)"
                            : "0px 0px 20px 0px rgba(0, 0, 0, 0.0)",
                        color: selectedDay == index ? "#fe385c" : "black",
                      }}
                      exit={{
                        boxShadow: "0px 0px 20px 30px rgba(0, 0, 0, 0.1)",
                      }}
                      key={index}
                      className={`p-2 relative rounded-full w-full  shadow-2xs text-center cursor-pointer`}
                      onClick={() => handleSelectedDay(index)}
                    >
                      Day {index + 1}
                    </motion.div>
                  ))}
                </motion.div>
                <div className="w-full rounded-b-2xl h-4/5 p-3 ">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`day-${selectedDay}`}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="overflow-y-auto h-full"
                    >
                      {calendar[selectedDay]
                        .sort((a, b) => a.id - b.id)
                        .map((item) => (
                          <PlaceCard
                            key={item.id}
                            id={item.id}
                            place={item.place}
                            time={item.time}
                            transport={item.transport}
                            image={item.image}
                            onRefresh={() => handleRefreshActivity(item.id)}
                            refreshing={refreshingActivity === item.id}
                          />
                        ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Right Side */}
        <div className="w-full md:w-1/2 bg-blue-100 flex items-center justify-center overflow-hidden text-gray-500 rounded-lg h-[47rem]">
          <Map polylines={routes[selectedDay]} markers={markers[selectedDay]} />
        </div>
      </div>
    </PageTemplate>
  );
}

export default Itinerary;
