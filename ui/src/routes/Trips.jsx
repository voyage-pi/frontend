import { useState } from "react";
import PageTemplate from "../components/PageTemplate";
import TripCard from "../components/TripCard";
import SearchHeader from "../components/SearchBar";
import userData from "../../public/user.json";

function Trips() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTrips = userData.trips.filter(trip =>
    trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTrip = () => {
    console.log("Create new trip");
  };

  return (
    <PageTemplate>
      <SearchHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCreateNew={handleCreateTrip}
        createButtonText="New Trip"
        placeholder="Search..."
      />

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