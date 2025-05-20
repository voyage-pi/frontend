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
import { FaRegFloppyDisk, FaMapLocationDot } from "react-icons/fa6";
import { HiOutlineTrash } from "react-icons/hi2";
import { IoIosTimer } from "react-icons/io";
import { GiPathDistance } from "react-icons/gi";
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

  // State for export dropdown
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);
  // road states
  const [tripType, setTripType] = useState();
  const [stops, setStops] = useState([]);
  const [distancePill, setDistancePill] = useState([]);

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
          const data = response.data.response;
          console.log("Loaded itinerary data from API:", data);

          if (data.questions && data.questions.user123) {
            const userQuestions = data.questions.user123;
            const ratings = userQuestions.map((q) => q.value);
            if (ratings.length > 0) {
              localStorage.setItem("userRatings", JSON.stringify(ratings));
              console.log("Loaded user ratings from API:", ratings);
            }
          }

          setTripType(data.itinerary.trip_type);
          if (data.itinerary.trip_type == "road") {
            processRoadData(data);
          } else {
            processItineraryData(data);
          }
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
              if (localStorage.getItem("Trip Typ")) processItineraryData(data);
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
  const processRoadData = async (data) => {
    const responseItinerary = data.itinerary;
    setItinerary(responseItinerary);
    let all_stops = [];
    let routesRoad = [];
    let markersRoad = [];
    let imagePromises = [];
    for (const stop of responseItinerary.stops) {
      const photoPromise = getPhotoUrl(stop.place).then((imageUrl) => {
        all_stops.push({
          id: stop.id,
          place: stop.place,
          order: stop.index,
          image: imageUrl,
        });

        if (stop.place.location) {
          markersRoad.push({
            position: {
              lat: stop.place.location.latitude,
              lng: stop.place.location.longitude,
            },
            title: stop.place.name,
            address: stop.place.name,
            image: imageUrl,
          });
        }
      });
      imagePromises.push(photoPromise);
    }

    await Promise.all(imagePromises);

    all_stops = all_stops.sort((a, b) =>
      a.order < b.order ? -1 : a.order > b.order ? 1 : 0
    );
    setStops(all_stops);
    let totalDistance = 0;
    routesRoad.push({
      polylines: responseItinerary.routes.map((route) => ({
        polylineEncoded: route.polylineEncoded,
        duration: route.duration,
        distance: route.distance,
      })),
    });
    for (const r of routesRoad[0].polylines) {
      totalDistance = totalDistance + parseFloat(r.distance);
    }
    setTitle(responseItinerary.name);
    setRoutes(routesRoad);
    setMarkers(markersRoad);
    setDistancePill(totalDistance);
    setTitle(responseItinerary.name);
    setLoading(false);
  };
  const processItineraryData = async (data) => {
    console.log("data", data);
    if (data) {
      let responseItinerary = null;
      if (data.response?.itinerary) {
        responseItinerary = data.response.itinerary;
      } else {
        responseItinerary = data.itinerary;
      }
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
                    unformatted_time: activity.start_time,
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
                    unformatted_time: activity.start_time,
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

      if (response.data.itinerary) {
        const newItineraryData = {
          response: {
            itinerary: response.data.itinerary,
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

  const handleDeleteActivity = async (activityId) => {
    try {
      setNotification({
        type: "info",
        text: "Deleting activity...",
        key: Date.now(),
      });

      const response = await axiosInstance.delete(
        `/trip/${tripId}/activity/${activityId}`
      );

      console.log("Response from delete activity:", response.data);

      // Check for various possible response structures
      let itineraryData = response.data.itinerary;
      if (response.data.response?.itinerary) {
        itineraryData = response.data.response.itinerary;
      } else if (response.data.data?.itinerary) {
        itineraryData = response.data.data.itinerary;
      } else if (response.data.itinerary) {
        itineraryData = response.data.itinerary;
      }

      console.log("itineraryData", itineraryData);

      if (itineraryData) {
        const newItineraryData = {
          response: {
            itinerary: itineraryData,
          },
        };
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

        setNotification({
          type: "success",
          text: "Activity deleted successfully",
          key: Date.now(),
        });
      } else {
        // If the API call succeeded but we couldn't parse the itinerary data,
        // we'll reload the trip data completely to ensure the UI is updated
        console.log(
          "Could not find itinerary in response, reloading trip data"
        );

        try {
          const tripResponse = await axiosInstance.get(`/trips/${tripId}`);
          if (tripResponse.data && tripResponse.data.response) {
            const data = tripResponse.data.response;
            if (data.itinerary.trip_type === "road") {
              processRoadData(data);
            } else {
              processItineraryData(data);
            }

            setNotification({
              type: "success",
              text: "Activity deleted successfully",
              key: Date.now(),
            });
          }
        } catch (reloadError) {
          console.error("Error reloading trip data:", reloadError);
          setNotification({
            type: "error",
            text: "Activity deleted but failed to update the view. Please refresh the page.",
            key: Date.now(),
          });
        }
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      setNotification({
        type: "error",
        text:
          "Error deleting activity: " +
          (error.response?.data?.message || error.message),
        key: Date.now(),
      });
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
              <div className="relative" ref={exportDropdownRef}>
                <button
                  className="btn btn-md btn-white rounded-full btn-circle shadow-sm flex items-center justify-center"
                  onClick={() =>
                    tripType == "road"
                      ? handleOpenInGoogleMaps()
                      : setExportDropdownOpen((open) => !open)
                  }
                  aria-haspopup="true"
                  aria-expanded={exportDropdownOpen}
                >
                  <FaMapLocationDot className="text-primary text-xl" />
                </button>
                {exportDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                    {tripType !== "road" &&
                    itinerary.days &&
                    itinerary.days.length > 0 ? (
                      itinerary.days.map((_, idx) => (
                        <button
                          key={idx}
                          className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-700"
                          onClick={() => {
                            handleOpenInGoogleMaps(idx);
                            setExportDropdownOpen(false);
                          }}
                        >
                          Export Day {idx + 1}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-400">
                        No days to export
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center justify-between pb-5">
              <div className="flex flex-row gap-x-5">
                {tripType !== "road" && (
                  <div className="rounded-full border-1 border-secondary/10">
                    <div className="flex flex-row items-center gap-x-3 m-1">
                      <GoClock className="text-primary ml-1" />
                      <div className="mr-2">
                        <span className="font-bold"> {totalDays} </span>
                        {totalDays === 1 ? "day" : "days"}
                      </div>
                    </div>
                  </div>
                )}
                {tripType !== "road" && (
                  <div className="rounded-full border-1 border-secondary/10">
                    <div className="flex flex-row items-center gap-x-3 m-1">
                      <GoPeople className="text-primary ml-1" />
                      <div className="mr-2">
                        <span className="font-bold"> {totalPeople} </span>
                        {totalPeople === 1 ? "person" : "people"}
                      </div>
                    </div>
                  </div>
                )}
                {!tripType == "road" && (
                  <div className="rounded-full border-1 border-secondary/10">
                    <div className="flex flex-row items-center gap-x-3 m-1">
                      <IoLocationOutline className="text-primary ml-1" />
                      <div className="mr-2">
                        <span> {locationName} </span>
                      </div>
                    </div>
                  </div>
                )}
                {tripType == "road" && (
                  <div className="rounded-full border-1 border-secondary/10">
                    <div className="flex flex-row items-center gap-x-3 m-1">
                      <GiPathDistance className="text-primary ml-1" />
                      <div className="mr-2">
                        <span> {parseInt(distancePill / 1000) + " km"} </span>
                      </div>
                    </div>
                  </div>
                )}
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
              ) : tripType == "road" ? (
                <>
                  <div className="h-full overflow-y-auto">
                    {stops.map((item, index) => (
                      <PlaceCard
                        key={index}
                        id={item.order}
                        place={item.place.name}
                        time={null}
                        transport={""}
                        image={item.image}
                        onRefresh={() => {}}
                        onDelete={
                          tripType === "road"
                            ? null
                            : () => handleDeleteActivity(item.id)
                        }
                        road={true}
                      />
                    ))}
                  </div>
                </>
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
                          .sort((a, b) =>
                            a.id < b.id ? -1 : a.id > b.id ? 1 : 0
                          )
                          .map((item, index) => (
                            <PlaceCard
                              key={item.id}
                              id={index}
                              place={item.place}
                              time={item.time}
                              transport={item.transport}
                              image={item.image}
                              onRefresh={() => handleRefreshActivity(item.id)}
                              onDelete={() => handleDeleteActivity(item.id)}
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
              polylines={tripType !== "road" ? routes[selectedDay] : routes}
              markers={tripType !== "road" ? markers[selectedDay] : markers}
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default Itinerary;
