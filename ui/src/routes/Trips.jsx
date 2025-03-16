import { useState } from "react";
import PageTemplate from "../components/PageTemplate";
import TripCard from "../components/TripCard";
import userData from "../../public/user.json";
import { FaSistrix } from "react-icons/fa6";

function Trips() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter trips based on search term
  const filteredTrips = userData.trips.filter(trip =>
    trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTemplate>
      <div className="flex justify-between items-center mb-6">

        <div className="relative w-full max-w- mr-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FaSistrix className="z-50 opacity-50 text-2xl"/>
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="input bg-white w-full pl-11 pr-4 rounded-full text-lg shadow-sm focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn btn-primary normal-case rounded-full flex items-center gap-2 px-6">
          <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center -ml-5">
            <span className="text-primary text-3xl font-light">+</span>
          </div>
          <span className="text-primary-content text-lg font-bold ml-2">New Trip</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTrips.map((trip) => (
          <TripCard
            key={trip.id}
            image={trip.image}
            days={trip.days}
            people={trip.people}
            destinations={trip.destinations}
            name={trip.name}
            date={trip.date}
          />
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No trips found matching your search.</p>
        </div>
      )}
    </PageTemplate>
  );
}

export default Trips;