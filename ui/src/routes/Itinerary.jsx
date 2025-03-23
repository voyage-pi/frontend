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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PageTemplate from "../components/PageTemplate";

const SortableItem = ({ id, place, time, transport, image }) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border rounded-lg p-3 mb-4 cursor-grab bg-white shadow-md"
    >
      <div className="flex items-start">
        <img
          src={image}
          alt={place}
          className="w-24 h-24 object-cover rounded mr-4"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{place}</h3>
          <p className="text-sm text-gray-500">{time}</p>
          {transport && (
            <p className="text-xs text-gray-400">
              {transport.type} - {transport.duration}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

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
