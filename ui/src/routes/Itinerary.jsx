import React, { useState, useEffect } from "react";
import PageTemplate from "../components/PageTemplate";

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

  return (
    <PageTemplate>
      <div className="flex flex-col md:flex-row p-4 h-screen">
        {/* Left side - Itinerary details */}
        <div className="w-full md:w-1/2 pr-4 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Barcelona</h1>

          {loading ? (
            <p>Loading itinerary...</p>
          ) : (
            Object.keys(itinerary).map((day, index) => (
              <div key={index} className="collapse collapse-arrow bg-base-100 border border-base-300 mb-2">
                <input type="radio" name="itinerary-accordion" defaultChecked={index === 0} />
                <div className="collapse-title font-semibold">{day}</div>
                <div className="collapse-content">
                  {itinerary[day].length > 0 ? (
                    itinerary[day].map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-2 mb-4">
                        <div className="flex items-start">
                          <img
                            src="/api/placeholder/80/80"
                            alt={item.place}
                            className="w-20 h-20 object-cover rounded mr-4"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.place}</h3>
                            <p className="text-sm text-gray-500">{item.time}</p>
                            {item.transport && (
                              <p className="text-xs text-gray-400">
                                {item.transport.type} - {item.transport.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic p-4 text-center">No itinerary items for this day</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right side - Map */}
        <div className="w-full md:w-1/2 h-96 md:h-full bg-blue-100 rounded-lg">
          <img
            src="/api/placeholder/800/600"
            alt="Barcelona Map"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </PageTemplate>
  );
}

export default Itinerary;
