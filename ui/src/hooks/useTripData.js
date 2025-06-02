import { useReducer, useEffect, useRef } from "react";
import { axiosInstance } from "../utils/axiosInstance";

// Initial state
const initialState = {
  itinerary: {},
  title: "",
  totalDays: 0,
  totalPeople: 0,
  price_range: { start_price: 0.0, end_price: 0.0, currency: "EUR" },
  locationName: "",
  calendar: [],
  days: {},
  loading: true,
  routes: [],
  markers: [],
  tripType: undefined,
  stops: [],
  distancePill: [],
  participants: [],
};

// Action types
const ACTION_TYPES = {
  SET_LOADING: "SET_LOADING",
  SET_TRIP_TYPE: "SET_TRIP_TYPE",
  PROCESS_ROAD_DATA: "PROCESS_ROAD_DATA",
  PROCESS_ITINERARY_DATA: "PROCESS_ITINERARY_DATA",
  UPDATE_STOPS: "UPDATE_STOPS",
};

// Reducer function
function tripReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTION_TYPES.SET_TRIP_TYPE:
      return { ...state, tripType: action.payload };

    case ACTION_TYPES.PROCESS_ROAD_DATA: {
      const {
        itinerary,
        title,
        routes,
        markers,
        distancePill,
        participants: roadParticipants,
      } = action.payload;

      return {
        ...state,
        itinerary,
        title,
        routes,
        markers,
        distancePill,
        participants: roadParticipants,
        loading: false,
      };
    }

    case ACTION_TYPES.UPDATE_STOPS:
      return {
        ...state,
        stops: action.payload,
      };

    case ACTION_TYPES.PROCESS_ITINERARY_DATA: {
      const {
        itinerary: itineraryData,
        title: titleData,
        totalDays,
        totalPeople,
        price_range,
        locationName,
        calendar,
        days,
        routes: routesData,
        markers: markersData,
        participants: itineraryParticipants,
      } = action.payload;

      return {
        ...state,
        itinerary: itineraryData,
        title: titleData,
        totalDays,
        totalPeople,
        price_range,
        locationName,
        calendar,
        days,
        routes: routesData,
        markers: markersData,
        participants: itineraryParticipants,
        loading: false,
      };
    }

    default:
      return state;
  }
}

export function useTripData(tripId, getPhotoUrl) {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  // Cache to store already fetched photo URLs
  const photoCache = useRef(new Map());
  // Flag to track if the component is still mounted
  const isMounted = useRef(true);

  // Helper function for placeholders as a fallback
  const generatePlaceholderImage = (seed) => {
    const seedStr = typeof seed === "string" ? seed : "place";
    const cleanSeed = seedStr.replace(/[^a-zA-Z0-9]/g, "");
    return `https://picsum.photos/seed/${encodeURIComponent(
      cleanSeed
    )}/400/300`;
  };

  // Cached version of getPhotoUrl with error handling
  const getCachedPhotoUrl = async (place) => {
    const placeId = place.id || place.name;

    // Return from cache if available
    if (photoCache.current.has(placeId)) {
      return photoCache.current.get(placeId);
    }

    try {
      // Get photo URL from the original function
      const photoUrl = await getPhotoUrl(place);

      // Cache the result if component is still mounted
      if (isMounted.current) {
        photoCache.current.set(placeId, photoUrl);
      }

      return photoUrl;
    } catch (error) {
      console.error("Error fetching photo URL:", error);
      // Use placeholder on error
      const fallbackUrl = generatePlaceholderImage(place.name);
      if (isMounted.current) {
        photoCache.current.set(placeId, fallbackUrl);
      }
      return fallbackUrl;
    }
  };

  // Process photo promises in batches to avoid rate limiting
  const processPhotoPromisesInBatches = async (
    promisesArray,
    batchSize = 3,
    delayMs = 300
  ) => {
    const results = [];

    for (let i = 0; i < promisesArray.length; i += batchSize) {
      const batch = promisesArray.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);

      // Add delay between batches if not the last batch
      if (i + batchSize < promisesArray.length && isMounted.current) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  };

  const processRoadData = async (data) => {
    const responseItinerary = data.itinerary;
    const tripParticipants = data.participants || [];
    let all_stops = [];
    let routesRoad = [];
    let markersRoad = [];
    let imagePromises = [];

    for (const stop of responseItinerary.stops) {
      const photoPromise = getCachedPhotoUrl(stop.place).then((imageUrl) => {
        if (isMounted.current) {
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
        }
      });
      imagePromises.push(photoPromise);
    }

    await processPhotoPromisesInBatches(imagePromises);

    if (isMounted.current) {
      all_stops = all_stops.sort((a, b) =>
        a.order < b.order ? -1 : a.order > b.order ? 1 : 0
      );

      dispatch({ type: ACTION_TYPES.UPDATE_STOPS, payload: all_stops });

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

      dispatch({
        type: ACTION_TYPES.PROCESS_ROAD_DATA,
        payload: {
          itinerary: responseItinerary,
          title: responseItinerary.name,
          routes: routesRoad,
          markers: markersRoad,
          distancePill: totalDistance,
          participants: tripParticipants,
        },
      });
    }
  };

  const processItineraryData = async (data) => {
    if (data) {
      let responseItinerary = null;
      let tripParticipants = [];
      if (data.response?.itinerary) {
        responseItinerary = data.response.itinerary;
        tripParticipants = data.response.participants || [];
      } else {
        responseItinerary = data.itinerary;
        tripParticipants = data.participants || [];
      }
      console.log("Processing itinerary data:", responseItinerary);
      console.log("Processing participants data:", tripParticipants);

      const calendar = [];
      const AllroutesData = [];
      const AllmarkersData = [];
      const imagePromises = [];
      const days = responseItinerary.days || {};

      if (responseItinerary.days) {
        for (const day of responseItinerary.days) {
          const dayActivities = [];
          const routesData = [];
          const markersData = [];
          if (day.morning_activities) {
            for (const activity of day.morning_activities) {
              const photoPromise = getCachedPhotoUrl(activity.place).then(
                (imageUrl) => {
                  if (isMounted.current) {
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
                }
              );

              imagePromises.push(photoPromise);
            }
          }

          if (day.afternoon_activities) {
            for (const activity of day.afternoon_activities) {
              const photoPromise = getCachedPhotoUrl(activity.place).then(
                (imageUrl) => {
                  if (isMounted.current) {
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

      await processPhotoPromisesInBatches(imagePromises);

      if (isMounted.current) {
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

        dispatch({
          type: ACTION_TYPES.PROCESS_ITINERARY_DATA,
          payload: {
            itinerary: responseItinerary,
            title: responseItinerary.title || "",
            totalDays: responseItinerary.days?.length || 0,
            price_range: responseItinerary.price_range || {
              start_price: 0.0,
              end_price: 0.0,
              currency: "EUR",
            },
            locationName: responseItinerary.locationName || "",
            calendar: calendar,
            days: days,
            routes: AllroutesData,
            markers: AllmarkersData,
            participants: tripParticipants,
          },
        });
      }
    } else {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Load trip data on component mount or tripId change
  useEffect(() => {
    // Reset mounted flag to true
    isMounted.current = true;

    if (!tripId) return;

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
    console.log("Loading trip data for ID:", tripId);

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

        if (isMounted.current) {
          dispatch({
            type: ACTION_TYPES.SET_TRIP_TYPE,
            payload: data.itinerary.trip_type,
          });

          if (data.itinerary.trip_type === "road") {
            processRoadData(data);
          } else {
            processItineraryData(data);
          }
        }
      })
      .catch((error) => {
        console.error("Error loading itinerary from API:", error);
        console.error("Error details:", error.response?.data);
        if (isMounted.current) {
          dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
        }
      });

    // Cleanup function to handle component unmount
    return () => {
      isMounted.current = false;
    };
  }, [tripId]);

  return {
    tripData: {
      itinerary: state.itinerary,
      title: state.title,
      totalDays: state.totalDays,
      totalPeople: state.totalPeople,
      price_range: state.price_range,
      locationName: state.locationName,
      calendar: state.calendar,
      days: state.days,
      loading: state.loading,
      routes: state.routes,
      markers: state.markers,
      tripType: state.tripType,
      stops: state.stops,
      distancePill: state.distancePill,
      participants: state.participants,
    },
    actions: {
      processRoadData,
      processItineraryData,
      formatTime,
      generatePlaceholderImage,
    },
  };
}
