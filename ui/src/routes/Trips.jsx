import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance"; 
import PageTemplate from "../components/PageTemplate";
import TripCard from "../components/TripCard";
import SearchHeader from "../components/SearchBar";
import TabBar from "../components/TabBar";

function Trips() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/trips/@ruimachado");
        setUserTrips(response.data.trips); // Store trips in state
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);   
  
  const handleCreateTrip = () => {
    console.log("Create new trip");
  };

  const tabs = [
    { value: "all", label: "All trips" },
    { value: "drafted", label: "Drafted" },
    { value: "incoming", label: "Incoming" },
    { value: "completed", label: "Completed" },
  ];

  const searchFiltered = userTrips.filter((trip) =>
    trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrips = searchFiltered.filter((trip) => {
    if (activeTab === "all") return true;
    if (activeTab === "drafted") return trip.status === "drafted";
    if (activeTab === "incoming") return trip.status === "incoming";
    if (activeTab === "completed") return trip.status === "completed";
    return true;
  });

  return (
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
        {loading ? (
          <div>Loading...</div>
        ) : filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              image={trip.image}
              days={trip.days}
              people={trip.people}
              destinations={trip.destinations}
              name={trip.name}
              date={trip.date}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No trips found matching your search.</p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}

export default Trips;
