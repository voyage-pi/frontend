import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TfiReload } from "react-icons/tfi";
import { HiOutlineTrash } from "react-icons/hi2";

const SortableItem = ({ id, place, time, transport, image }) => {
    const { attributes, listeners, setNodeRef, transform } = useSortable({ id });
    const [imgError, setImgError] = useState(false);

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition: "none",
    };

    // Fallback image if the provided one fails to load
    const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(place)}/200/200`;

    return (
        <div 
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex flex-col">
            <div
                className="flex flex-row items-center">
                <div className="shadow-primary/20 rounded-lg p-3 pl-3 mb-4 cursor-grab bg-white shadow-md w-full">
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
                            src={imgError ? fallbackImage : image}
                            alt={place}
                            className="w-20 h-20 object-cover rounded-lg mr-4 ml-4"
                            onError={() => setImgError(true)}
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
                <div className="flex flex-col items-center justify-between pl-3 -mr-2 gap-y-2 -mt-3">
                    <div className="btn btn-sm btn-white rounded-full btn-circle shadow-sm">
                        <TfiReload className="text-primary text-lg" />
                    </div>
                    <div className="btn btn-sm btn-white rounded-full btn-circle shadow-sm">
                        <HiOutlineTrash className="text-primary text-xl" />
                    </div>
                </div>
            </div>
            {transport && transport.type && transport.duration ? (
                    <p className="text-xs text-gray-400">
                        {transport.type} - {transport.duration}
                    </p>
                ) : (
                    <p className="text-xs text-gray-400"></p>
                )}
        </div>
    );
};

export default SortableItem;