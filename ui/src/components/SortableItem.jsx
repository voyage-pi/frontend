import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
      className="shadow-primary/20 rounded-lg p-3 pl-3 mb-4 cursor-grab bg-white shadow-md"
    >
      <div className="flex items-center">
        <div className="flex flex-col gap-1">
            {[0, 1, 2].map((row) => (
                <div key={`row-${row}`} className="flex gap-1">
                    {[0, 1].map((col) => (
                        <div
                            key={`dot-${row}-${col}`}
                            className="w-1 h-1 rounded-full bg-primary/80"
                        />
                    ))}
                </div>
            ))}
        </div>
        <img
          src={image}
          alt={place}
          className="w-20 h-20 object-cover rounded-lg mr-4 ml-4"
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

export default SortableItem;