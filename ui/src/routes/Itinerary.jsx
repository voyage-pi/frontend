import React, { useState, useEffect, useRef } from "react";
import { axiosPlace, axiosInstance, axiosUser } from "../utils/axiosInstance";
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
import { supabase } from "../utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";

function Itinerary() {
  // Check if the user is authenticated
  const { isAuthenticated, LoggedUser } = useAuth();

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
  const [isPreferencesSidebarOpen, setIsPreferencesSidebarOpen] =
    useState(false);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);

  // Cursor tracking state
  const [otherCursors, setOtherCursors] = useState({});
  const [cursorId, setCursorId] = useState(null);
  const pageRef = useRef(null);
  const [cursorClicks, setCursorClicks] = useState({});
  const [hasActiveCollaborators, setHasActiveCollaborators] = useState(false);

  useEffect(() => {
    // Generate a unique cursor ID on component mount
    const newCursorId = uuidv4();
    setCursorId(newCursorId);

    return () => {
      // Clean up cursor data when leaving the page
      if (cursorId && tripId) {
        supabase
          .from("cursors")
          .delete()
          .match({ id: cursorId, trip_id: tripId })
          .then(() => {
            console.log("Cursor data cleaned up");
          });
      }
    };
  }, []);

  useEffect(() => {
    if (!tripId || !cursorId) return;

    console.log(
      `Setting up cursor channel for trip ${tripId} with cursor ID ${cursorId}`
    );

    // Create a single channel instance for cursor updates
    const cursorChannel = supabase.channel(`cursors-${tripId}`);

    // Subscribe to cursor updates for this trip
    cursorChannel
      .on("broadcast", { event: "cursor-move" }, handleCursorUpdate)
      .on("broadcast", { event: "user-joined" }, handleUserJoined)
      .on("broadcast", { event: "user-left" }, handleUserLeft)
      .subscribe((status) => {
        console.log(`Cursor channel status: ${status}`);

        // Announce this user's presence when joining
        if (status === "SUBSCRIBED" && isAuthenticated) {
          cursorChannel.send({
            type: "broadcast",
            event: "user-joined",
            payload: {
              userId: LoggedUser?.id || "anonymous",
              cursorId: cursorId,
            },
          });
        }
      });

    // Store the channel reference for sending updates
    window._cursorChannel = cursorChannel;

    return () => {
      // Announce this user is leaving
      if (cursorChannel && isAuthenticated) {
        cursorChannel.send({
          type: "broadcast",
          event: "user-left",
          payload: {
            userId: LoggedUser?.id || "anonymous",
            cursorId: cursorId,
          },
        });
      }

      console.log("Unsubscribing from cursor channel");
      cursorChannel.unsubscribe();
      window._cursorChannel = null;
    };
  }, [tripId, cursorId, isAuthenticated]);

  const handleUserJoined = (payload) => {
    if (payload && payload.payload && payload.payload.cursorId !== cursorId) {
      setHasActiveCollaborators(true);

      // Send back our presence to the new user
      if (window._cursorChannel && isAuthenticated) {
        window._cursorChannel.send({
          type: "broadcast",
          event: "user-joined",
          payload: {
            userId: LoggedUser?.id || "anonymous",
            cursorId: cursorId,
          },
        });
      }
    }
  };

  const handleUserLeft = (payload) => {
    if (payload && payload.payload && payload.payload.cursorId !== cursorId) {
      // Remove the cursor of the user who left
      setOtherCursors((prev) => {
        const updated = { ...prev };
        delete updated[payload.payload.cursorId];

        // Check if there are any remaining collaborators
        const remainingUsers = Object.keys(updated).length;
        if (remainingUsers === 0) {
          setHasActiveCollaborators(false);
        }

        return updated;
      });
    }
  };

  const handleCursorUpdate = (payload) => {
    console.log("Received cursor update:", payload);
    if (
      payload &&
      payload.payload &&
      payload.payload.cursor &&
      payload.payload.cursor.id !== cursorId
    ) {
      const cursor = payload.payload.cursor;
      setHasActiveCollaborators(true);

      // If it's a click event, store it with animation state
      if (cursor.isClicking) {
        setCursorClicks((prev) => ({
          ...prev,
          [cursor.id]: {
            x: cursor.x,
            y: cursor.y,
            timestamp: Date.now(),
          },
        }));
      }

      setOtherCursors((prev) => ({
        ...prev,
        [cursor.id]: {
          ...cursor,
          lastUpdate: new Date().getTime(),
        },
      }));
    }
  };

  const updateCursorPosition = (e) => {
    if (
      !tripId ||
      !cursorId ||
      !pageRef.current ||
      !isAuthenticated ||
      !window._cursorChannel ||
      !hasActiveCollaborators
    )
      return;

    const rect = pageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const cursorData = {
      id: cursorId,
      trip_id: tripId,
      user_id: LoggedUser?.id || "anonymous",
      user_name:
        LoggedUser?.email?.split("@")[0] ||
        LoggedUser?.user_metadata?.full_name ||
        LoggedUser?.email ||
        "Guest",
      x: x,
      y: y,
      timestamp: new Date().toISOString(),
      isClicking: false,
    };

    // Throttle cursor updates to reduce network traffic
    const now = Date.now();
    if (now - (window._lastCursorUpdate || 0) < 50) return; // Limit to 20 updates per second
    window._lastCursorUpdate = now;

    // Broadcast cursor position using the stored channel reference
    window._cursorChannel
      .send({
        type: "broadcast",
        event: "cursor-move",
        payload: { cursor: cursorData },
      })
      .then(() => {
        // Uncomment for verbose logging
        // console.log('Cursor position sent');
      })
      .catch((error) => {
        console.error("Error sending cursor position:", error);
      });
  };

  const handleCursorClick = (e) => {
    if (
      !tripId ||
      !cursorId ||
      !pageRef.current ||
      !isAuthenticated ||
      !window._cursorChannel ||
      !hasActiveCollaborators
    )
      return;

    const rect = pageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const cursorData = {
      id: cursorId,
      trip_id: tripId,
      user_id: LoggedUser?.id || "anonymous",
      user_name:
        LoggedUser?.email?.split("@")[0] ||
        LoggedUser?.user_metadata?.full_name ||
        LoggedUser?.email ||
        "Guest",
      x: x,
      y: y,
      timestamp: new Date().toISOString(),
      isClicking: true,
    };

    // Broadcast click event only if there are other users
    window._cursorChannel
      .send({
        type: "broadcast",
        event: "cursor-move",
        payload: { cursor: cursorData },
      })
      .catch((error) => {
        console.error("Error sending cursor click:", error);
      });
  };

  // Clean up old clicks after animation finishes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursorClicks((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          if (now - updated[id].timestamp > 800) {
            // 800ms animation duration
            delete updated[id];
          }
        });
        return updated;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Remove stale cursors after 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setOtherCursors((prevCursors) => {
        const updated = { ...prevCursors };
        Object.keys(updated).forEach((id) => {
          if (now - updated[id].lastUpdate > 10000) {
            delete updated[id];
          }
        });
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("=== Itinerary Loading Started ===");
    console.log("Location state:", location.state);
    console.log("Trip ID from URL:", tripId);

    if (tripId) {
      console.log("Loading from: Trip ID (URL Parameter)");
      axiosInstance
        .get(`/trips/${tripId}`)
        .then((response) => {
          const data = response.data;
          console.log("Loaded itinerary data from API:", data);

          if (data.questions && data.questions.user123) {
            const userQuestions = data.questions.user123;
            const ratings = userQuestions.map((q) => q.value);
            if (ratings.length > 0) {
              localStorage.setItem("userRatings", JSON.stringify(ratings));
              console.log("Loaded user ratings from API:", ratings);
            }
          }

          processItineraryData(data);
        })
        .catch((error) => {
          console.error("Error loading itinerary from API:", error);
          console.error("Error details:", error.response?.data);
        });
    } else {
      console.log("Loading from: Fallback JSON File");
      fetch("/trip_management_resp.json")
        .then((response) => response.json())
        .then((data) => {
          console.log("Loaded itinerary data from JSON file:", data);
          processItineraryData(data);
        })
        .catch((error) => {
          console.error("Error loading itinerary from JSON:", error);
        });
    }
  }, [location, tripId]);

  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`trip-${tripId}`)
      .on("broadcast", { event: "trip-update" }, ({ payload }) => {
        if (
          payload.tripId === tripId &&
          payload.timestamp !== lastUpdateTimestamp
        ) {
          setNotification({
            type: "info",
            text: "Trip has been updated by another user. Refreshing...",
            key: Date.now(),
          });
          // Refetch the trip data
          fetch(`/api/v1/trip-management/api/trips/${tripId}`)
            .then((response) => response.json())
            .then((data) => {
              processItineraryData(data);
            })
            .catch((error) => console.error("Error refreshing trip:", error));
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [tripId, lastUpdateTimestamp]);

  useEffect(() => {
    // Initialize first day as open when itinerary is loaded
    if (!loading && itinerary.days && itinerary.days.length > 0) {
      // Only run this effect if we don't already have any open days
      if (Object.keys(openDays).length === 0) {
        setOpenDays({ 0: true });
      }
    }
  }, [loading, itinerary.days]);

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
    console.log("=== Processing Itinerary Data ===");
    console.log("Input data structure:", {
      hasResponse: Boolean(data.response),
      hasItinerary: Boolean(data.response?.itinerary),
      itineraryType: typeof data.response?.itinerary,
    });

    if (data.response && data.response.itinerary) {
      const responseItinerary = data.response.itinerary;
      console.log("Processing itinerary data:", responseItinerary);
      setItinerary(responseItinerary);
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

  const limitDays = 5;

  const handleSelectedDay = (dayIndex) => {
    console.log(routes);
    setSelectedDay(dayIndex);
    console.log(routes[selectedDay]);
  };

  const handleRefreshActivity = async (activityId) => {
    setRefreshingActivity(activityId);
    try {
      const response = await axiosInstance.post(
        `/trip/${tripId}/regenerate-activity`,
        {
          activityId: activityId,
        }
      );

      console.log("Updating itinerary");
      console.log("Response from refresh activity:", response.data);
      console.log("Itinerary", response.data.response.itinerary);

      if (response.data.response.itinerary) {
        const newItineraryData = {
          response: {
            itinerary: response.data.response.itinerary,
          },
        };
        console.log("New itinerary data:", newItineraryData);
        await processItineraryData(newItineraryData);

        // Set the timestamp of this update
        const updateTimestamp = new Date().toISOString();
        setLastUpdateTimestamp(updateTimestamp);

        // Broadcast the update to other users
        await supabase.channel(`trip-${tripId}`).send({
          type: "broadcast",
          event: "trip-update",
          payload: {
            tripId: tripId,
            timestamp: updateTimestamp,
          },
        });
      } else {
        console.error("Invalid response structure:", response);
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
    navigate("/");
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

      <div
        ref={pageRef}
        className="flex flex-col relative w-full"
        onMouseMove={updateCursorPosition}
        onClick={handleCursorClick}
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

        {/* Other users' cursors */}
        {Object.values(otherCursors)
          // Deduplicate cursors by user_id to show only the most recent one per user
          .reduce((unique, cursor) => {
            // Only keep the most recent cursor for each user_id
            const existing = unique.find((c) => c.user_id === cursor.user_id);
            if (!existing || existing.lastUpdate < cursor.lastUpdate) {
              // Remove any existing cursor for this user_id
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
        {Object.entries(cursorClicks)
          .filter(([id]) => id !== cursorId) // Don't show your own clicks
          .map(([id, click]) => (
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
          <div className="w-full md:w-1/2 pr-4 overflow-hidden  ">
            <div className="flex flex-row  mb-4 items-center gap-5">
              <h1 className="text-3xl font-bold">{title}</h1>
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
                <PreferencesButton
                  onClick={() => setIsPreferencesSidebarOpen(true)}
                />
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
            <Map
              polylines={routes[selectedDay]}
              markers={markers[selectedDay]}
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default Itinerary;
