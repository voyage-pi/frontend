import React, { useState, useEffect } from "react";
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
import PageTemplate from "../components/PageTemplate";
import SortableItem from "../components/SortableItem";
import VoyageLogo from "../assets/voyage-complete-logo-navy.png";
import { GoPeople, GoClock } from "react-icons/go";
import { TbMoneybag } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { CiSaveDown1 } from "react-icons/ci";
import { TfiReload } from "react-icons/tfi";
import Map from "../components/Map"; 

function Itinerary() {
    const [itinerary, setItinerary] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/trip_management_resp.json")
            .then((response) => response.json())
            .then((data) => {
                // Set the itinerary data from the new structure
                if (data.response && data.response.itinerary) {
                    const responseItinerary = data.response.itinerary;
                    
                    // Prepare the calendar object
                    const calendar = {};
                    if (responseItinerary.itinerary && responseItinerary.itinerary.days) {
                        responseItinerary.itinerary.days.forEach((day, index) => {
                            const dayKey = `Day ${index + 1}`;
                            const dayActivities = [];
                            
                            // Add morning activities
                            if (day.morning_activities) {
                                day.morning_activities.forEach(activity => {
                                    dayActivities.push({
                                        place: activity.place.name,
                                        time: `${formatTime(activity.start_time)} - ${formatTime(activity.end_time)}`,
                                        image: activity.place.photos && activity.place.photos.length > 0 ? 
                                            getImageUrl(activity.place.photos[0]) : "",
                                        transport: activity.transport || {}
                                    });
                                });
                            }
                            
                            // Add afternoon activities
                            if (day.afternoon_activities) {
                                day.afternoon_activities.forEach(activity => {
                                    dayActivities.push({
                                        place: activity.place.name,
                                        time: `${formatTime(activity.start_time)} - ${formatTime(activity.end_time)}`,
                                        image: activity.place.photos && activity.place.photos.length > 0 ? 
                                            getImageUrl(activity.place.photos[0]) : "",
                                        transport: activity.transport || {}
                                    });
                                });
                            }
                            
                            calendar[dayKey] = dayActivities;
                        });
                    }
                    
                    const totalDays = responseItinerary.itinerary && responseItinerary.itinerary.days ? 
                        responseItinerary.itinerary.days.length : 0;
                   
                        
                    // vai ser preciso arranjar esta informação de algum lado
                    setItinerary({
                        title: "Trip to Aveiro", 
                        totalDays: totalDays,
                        totalPeople: 1, 
                        budget: 0, 
                        location: "Aveiro", 
                        calendar: calendar
                    });
                }
                setLoading(false);
            })
            .catch((error) => console.error("Error loading itinerary:", error));
    }, []);

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getImageUrl = (photoReference) => {
        if (!photoReference) return "";
        if (photoReference.startsWith('http')) return photoReference;
        
        // as fotos do google places nao funcionam
        const parts = photoReference.split('/');
        const placeId = parts.length > 1 ? parts[1] : 'place';
        
        return `https://source.unsplash.com/400x300/?landmark,travel,museum&sig=${placeId}`;
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
            polylineEncoded: "mi`wFzqxs@pEbHRXLFxCtD|@jBl@bA~@lAr@r@|@dA\\f@SJKX?^DN`@\\VHVELM`@B|AxAVLh@@h@SpNoHtCuAVCRDNIHWb@_@nMwGtAe@dB[xD_A~@e@f@_@h@m@d@s@h@oAXYNERD`@Px@JXCPKV]HA`@RxAhAdA|@PFzPlNfAx@fEvD^d@BTLNPADEd@@h@TvKpC",
            duration: 583,
            distance: 4956
        },
      ],
    },
  ];

  const myMarkers = [
    {
        position: { lat: 40.61402777012159, lng: -8.656425489382625 },
        title: "DETI",
        address: "Universidade de Aveiro, 3810-193 Aveiro",
        image: "https://lh3.googleusercontent.com/p/AF1QipNIoDTmCa7-LUb4p804W_pnaVl6vJOBrl7yFo7H=w408-h255-k-no",
    },
    {
        position: { lat: 40.637322817325355, lng: -8.650697327204432 },
        title: "Santos da Praça",
        address: "Largo da Praça do Peixe 3, 3800-241 Aveiro",
        image: "https://lh3.googleusercontent.com/p/AF1QipM5l6T80v1PyOOVb7PTDCOdp-oiF0BSwNnypcg=w426-h240-k-no",
    }
  ];

    return (
        <PageTemplate>
            <div className="flex justify-center items-center flex-col w-full px-4 -mt-5">
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
                                    {itinerary.totalDays === 1 ? 'day' : 'days'}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-full border-1 border-secondary/10">
                            <div className="flex flex-row items-center gap-x-3 m-1">
                                <GoPeople className="text-primary ml-1" />
                                <div className="mr-2">
                                    <span className="font-bold"> {itinerary.totalPeople} </span>
                                    {itinerary.totalPeople === 1 ? 'person' : 'people'}
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
                                    <span > {itinerary.location} </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading itinerary...</p>
                    ) : (
                        Object.keys(itinerary.calendar).map((day, index) => (
                            <div
                                key={index}
                                className="collapse collapse-arrow bg-base-100 mb-6 -ml-4"
                            >
                                <input
                                    type="radio"
                                    name="itinerary-accordion"
                                    defaultChecked={index === 0}
                                />
                                <div className="collapse-title font-semibold text-xl">{day}</div>
                                <div className="collapse-content">
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
                </div>

                {/* Right Side */}
                <div className="w-full md:w-1/2 bg-blue-100 flex items-center justify-center overflow-hidden text-gray-500 rounded-lg h-[47rem]">
                <Map
                    polylines={myPolylines}
                    markers={myMarkers}
                />
                </div>
            </div>
        </PageTemplate>
    );
}

export default Itinerary;