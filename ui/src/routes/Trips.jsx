import { useState } from "react";
import { useNavigate } from "react-router-dom";  
import PageTemplate from "../components/PageTemplate";
import TripCard from "../components/TripCard";
import SearchHeader from "../components/SearchBar";
import TabBar from "../components/TabBar";
import userData from "../../public/user.json";

function Trips() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const to = useNavigate();

  const handleCreateTrip = () => {
    to("/forms");
  };

  const tabs = [
    { value: "all", label: "All trips" },
    { value: "drafted", label: "Drafted" },
    { value: "incoming", label: "Incoming" },
    { value: "completed", label: "Completed" },
  ];

  const searchFiltered = userData.trips.filter(trip =>
    trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrips = searchFiltered.filter(trip => {
    if (activeTab === "all") return true;
    if (activeTab === "drafted") return trip.status === "drafted";
    if (activeTab === "incoming") return trip.status === "incoming";
    if (activeTab === "completed") return trip.status === "completed";
    return true;
  });

  return (
    <div className="flex">
      <PageTemplate>
        <TabBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          tabs={tabs} 
        />

        <SearchHeader 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onCreateNew={handleCreateTrip}
          createButtonText="New Trip"
          placeholder="Search..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
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
    </div>
  );
}

export default Trips;