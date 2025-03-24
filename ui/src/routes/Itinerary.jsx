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

function Itinerary() {
  const [itinerary, setItinerary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/itinerary.json")
      .then((response) => response.json())
      .then((data) => {
        setItinerary(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error loading itinerary:", error));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event, day) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItinerary((prevItinerary) => {
      const items = prevItinerary[day];
      const oldIndex = items.findIndex((item) => item.place === active.id);
      const newIndex = items.findIndex((item) => item.place === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);

      return {
        ...prevItinerary,
        [day]: newOrder,
      };
    });
  };

  return (
    <PageTemplate>
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left Side - Itinerary Details */}
        <div className="w-full md:w-1/2 pr-4 overflow-y-auto h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Barcelona</h1>

          {loading ? (
            <p>Loading itinerary...</p>
          ) : (
            Object.keys(itinerary).map((day, index) => (
              <div
                key={index}
                className="collapse collapse-arrow bg-base-100 mb-2"
              >
                <input
                  type="radio"
                  name="itinerary-accordion"
                  defaultChecked={index === 0}
                />
                <div className="collapse-title font-semibold">{day}</div>
                <div className="collapse-content">
                  {itinerary[day].length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, day)}
                    >
                      <SortableContext
                        items={itinerary[day].map((item) => item.place)}
                        strategy={verticalListSortingStrategy}
                      >
                        {itinerary[day].map((item, idx) => (
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

        {/* Right Side - Full Screen Map (No Scroll) */}
        <div className="w-full md:w-1/2 h-screen bg-blue-100 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full">
            <img
              src="/api/placeholder/800/600"
              alt="Barcelona Map"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default Itinerary;