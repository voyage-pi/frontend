import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTemplate from "../components/PageTemplate";
import TripCard from "../components/TripCard";
import SearchHeader from "../components/SearchBar";
import TabBar from "../components/TabBar";
import userData from "../../public/user.json";
import Map from "../components/Map";

function Trips() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const handleCreateTrip = () => {
    navigate("/forms");
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

  const myPolylines = [
    {
      polylines: [
        {
            polylineEncoded: "",
            duration: 0,
            distance: 0
        },
      ],
    },
  ];

  const myMarkers = [
    {
        position: { lat: 32.61402777012159, lng: -8.656425489382625 },
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
      <div className="flex flex-col">
        <div className="flex">
          <div className="w-4/7">
            <TabBar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={tabs}
            />
            
            <div className="p-4 overflow-y-auto">
              <div className="mb-4">
                <SearchHeader
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onCreateNew={handleCreateTrip}
                  createButtonText="New Trip"
                  placeholder="Search..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 space-x-auto">                {filteredTrips.map((trip) => (
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
                
                {filteredTrips.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No trips found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-3/7 rounded-lg h-[51rem] overflow-hidden">
            <Map
              polylines={myPolylines}
              markers={myMarkers}
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default Trips;