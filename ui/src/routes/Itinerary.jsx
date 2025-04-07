import React, { useState, useEffect } from "react";
import { axiosPlace } from "../utils/axiosInstance";
import LoadingAnimation from "../components/LoadingAnimation";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useLocation } from "react-router-dom";
import PageTemplate from "../components/PageTemplate";
import SortableItem from "../components/SortableItem";
import VoyageLogo from "../assets/voyage-complete-logo-navy.png";
import { GoPeople, GoClock } from "react-icons/go";
import { TbMoneybag } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { CiSaveDown1 } from "react-icons/ci";
import { TfiReload } from "react-icons/tfi";
import { IoChevronDown } from "react-icons/io5"; // Added chevron icon
import Map from "../components/Map";

const CustomScrollbarStyle = () => (
  <style>{`
    .custom-scrollbar {
      scrollbar-width: thin;
    }
  `}</style>
);

function Itinerary() {
  const [itinerary, setItinerary] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [routes, setRoutes] = useState([]);
  const [markers, setMarkers] = useState([]);
  // State to track which days are open
  const [openDays, setOpenDays] = useState({});
  // Cache for photo URLs
  const [photoCache, setPhotoCache] = useState({});

  useEffect(() => {
    if (location.state?.itineraryData) {
      // Use data passed from Forms component
      const responseData = location.state.itineraryData;
      console.log("Received itinerary data from Forms:", responseData);
      processItineraryData(responseData);
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
  }, [location]);

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

  // Toggle function to open/close a day
  const toggleDay = (day) => {
    setOpenDays((prevState) => ({
      ...prevState,
      [day]: !prevState[day],
    }));
  };

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
      const photoUrl =
        response.data?.uri || generatePlaceholderImage(place.name);
      setPhotoCache((prev) => ({
        ...prev,
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event, day) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItinerary((prevItinerary) => {
      const items = prevItinerary.calendar[day];
      const oldIndex = items.findIndex((item) => item.place === active.id);
      const newIndex = items.findIndex((item) => item.place === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);

      return {
        ...prevItinerary,
        calendar: {
          ...prevItinerary.calendar,
          [day]: newOrder,
        },
      };
    });
  };

  const myPolylines = [
    {
      polylines: [
        {
          polylineEncoded:
            "mi`wFzqxs@pEbHRXLFxCtD|@jBl@bA~@lAr@r@|@dA\\f@SJKX?^DN`@\\VHVELM`@B|AxAVLh@@h@SpNoHtCuAVCRDNIHWb@_@nMwGtAe@dB[xD_A~@e@f@_@h@m@d@s@h@oAXYNERD`@Px@JXCPKV]HA`@RxAhAdA|@PFzPlNfAx@fEvD^d@BTLNPADEd@@h@TvKpC",
          duration: 583,
          distance: 4956,
        },
      ],
    },
  ];

  const myMarkers = [
    {
      position: { lat: 40.61402777012159, lng: -8.656425489382625 },
      title: "DETI",
      address: "Universidade de Aveiro, 3810-193 Aveiro",
      image:
        "https://lh3.googleusercontent.com/p/AF1QipNIoDTmCa7-LUb4p804W_pnaVl6vJOBrl7yFo7H=w408-h255-k-no",
    },
    {
      position: { lat: 40.637322817325355, lng: -8.650697327204432 },
      title: "Santos da Praça",
      address: "Largo da Praça do Peixe 3, 3800-241 Aveiro",
      image:
        "https://lh3.googleusercontent.com/p/AF1QipM5l6T80v1PyOOVb7PTDCOdp-oiF0BSwNnypcg=w426-h240-k-no",
    },
  ];

  const processItineraryData = async (data) => {
    if (data.response && data.response.itinerary) {
      const responseItinerary =
        data.response.itinerary.itinerary || data.response.itinerary;
      console.log("Processing itinerary data:", responseItinerary);

      const calendar = {};
      const routesData = [];
      const markersData = [];
      const imagePromises = [];

      if (responseItinerary.days) {
        for (const day of responseItinerary.days) {
          const dayIndex = responseItinerary.days.indexOf(day);
          const dayKey = `Day ${dayIndex + 1}`;
          const dayActivities = [];

          if (day.morning_activities) {
            for (const activity of day.morning_activities) {
              const photoPromise = getPhotoUrl(activity.place).then(
                (imageUrl) => {
                  dayActivities.push({
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

          calendar[dayKey] = dayActivities;
        }
      }

      await Promise.all(imagePromises);

      const totalDays = responseItinerary.days
        ? responseItinerary.days.length
        : 0;

      let location = "Aveiro";
      if (
        totalDays > 0 &&
        responseItinerary.days[0].morning_activities &&
        responseItinerary.days[0].morning_activities.length > 0
      ) {
        location =
          responseItinerary.days[0].morning_activities[0].place.name.split(
            ","
          )[0];
      }

      setItinerary({
        title: `Trip to ${location}`,
        totalDays: totalDays,
        totalPeople: 1,
        budget: responseItinerary.budget || 0,
        location: location,
        calendar: calendar,
      });

      setRoutes(routesData);
      setMarkers(markersData);
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

  return (
    <PageTemplate>
      <CustomScrollbarStyle />
      <div className="flex justify-center items-center flex-col w-full px-4 pt-2 ">
        <div className="mb-4">
          <img src={VoyageLogo} alt="Voyage Logo" className="h-30" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-min-screen p-10 -mt-10">
        {/* Left Side */}
        <div className="w-full md:w-1/2 pr-4 overflow-hidden">
          <div className="flex flex-row  mb-4 items-center gap-5">
            <h1 className="text-3xl font-bold">{itinerary.title}</h1>
            <div className="btn btn-md btn-primary rounded-full btn-circle shadow-sm">
              <CiSaveDown1 className="text-white text-2xl" />
            </div>
            {/* <div className="btn btn-md btn-white rounded-full btn-circle shadow-sm">
                            <TfiReload className="text-primary text-xl" />
                        </div> */}
          </div>

          <div className="flex flex-row gap-x-5 pb-5">
            <div className="rounded-full border-1 border-secondary/10">
              <div className="flex flex-row items-center gap-x-3 m-1">
                <GoClock className="text-primary ml-1" />
                <div className="mr-2">
                  <span className="font-bold"> {itinerary.totalDays} </span>
                  {itinerary.totalDays === 1 ? "day" : "days"}
                </div>
              </div>
            </div>

            <div className="rounded-full border-1 border-secondary/10">
              <div className="flex flex-row items-center gap-x-3 m-1">
                <GoPeople className="text-primary ml-1" />
                <div className="mr-2">
                  <span className="font-bold"> {itinerary.totalPeople} </span>
                  {itinerary.totalPeople === 1 ? "person" : "people"}
                </div>
              </div>
            </div>
            <div className="rounded-full border-1 border-secondary/10">
              <div className="flex flex-row items-center gap-x-3 m-1">
                <TbMoneybag className="text-primary ml-1" />
                <div className="mr-2">
                  <span className="font-bold"> {itinerary.budget} </span> €
                </div>
              </div>
            </div>
            <div className="rounded-full border-1 border-secondary/10">
              <div className="flex flex-row items-center gap-x-3 m-1">
                <IoLocationOutline className="text-primary ml-1" />
                <div className="mr-2">
                  <span> {itinerary.location} </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col text-center justify-center p-3">
            <LoadingAnimation />
            <div>Loading images and Places</div>
          </div>
        ) : (
          Object.keys(itinerary.calendar).map((day, index) => (
            <div
              key={index}
              className={`collapse mb-6 -ml-4 ${
                openDays[day] ? "collapse-open" : "collapse-close"
              }`}
            >
              <div
                className="collapse-title font-semibold text-xl bg-base-100 flex items-center justify-between cursor-pointer"
                onClick={() => toggleDay(day)}
              >
                <span>{day}</span>
                <IoChevronDown
                  className={`text-xl transition-transform duration-300 ${
                    openDays[day] ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
              <div className="collapse-content bg-base-100">
                {itinerary.calendar[day].length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, day)}
                  >
                    <SortableContext
                      items={itinerary.calendar[day].map((item) => item.place)}
                      strategy={verticalListSortingStrategy}
                    >
                      {itinerary.calendar[day].map((item, idx) => (
                        <SortableItem
                          key={idx}
                          id={item.place}
                          place={item.place}
                          time={item.time}
                          transport={item.transport}
                          image={item.image}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <p className="text-gray-500 italic p-4 text-center">
                    No itinerary items for this day
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {/* Right Side */}
        <div className="w-full md:w-1/2 bg-blue-100 flex items-center justify-center overflow-hidden text-gray-500 rounded-lg h-[47rem]">
          <Map
            polylines={routes.length > 0 ? routes : myPolylines}
            markers={markers.length > 0 ? markers : myMarkers}
          />
        </div>
      </div>
    </PageTemplate>
  );
}

export default Itinerary;
