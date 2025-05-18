import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { axiosUser } from "../utils/axiosInstance";
import PageTemplate from "../components/PageTemplate";
import { FaHeart } from "react-icons/fa";
import TabBar from "../components/TabBar";
import SearchBar from "../components/SearchBar";
import Map from "../components/Map";
import TripCard from "../components/TripCard";
import PlaceDetailSidebar from "../components/PlaceDetailSidebar";

function Saved() {
  const { userTag } = useParams(); // Get userTag from URL params
  const navigate = useNavigate();
  const { LoggedUser, isAuthenticated, isUserLoading } = useAuth();
  
  // Determine if we're viewing our own saved items or someone else's
  const [viewingUser, setViewingUser] = useState(null);
  const isViewingOwnSaved = !userTag || (LoggedUser && userTag === LoggedUser.tag);
  
  const tabs = [
    { value: "all", label: "All places" },
    { value: "attractions", label: "Attractions" },
    { value: "locations", label: "Locations" },
    { value: "restaurants", label: "Restaurants" },
  ];

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock saved places data
  const [savedPlaces, setSavedPlaces] = useState([
    { 
      key: 1, 
      name: "Estádio da Luz", 
      location: "Lisbon, Portugal", 
      image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
      type: "locations",
      position: { lat: 38.7528, lng: -9.1843 },
      description: "A major stadium in Lisbon, home to Benfica football club. It hosted the UEFA Euro 2004 final and has a capacity of over 65,000 spectators.",
      id:"ChIJTR30n_eXIw0RcrUR5K2DPJI"
    },
    { 
      key: 2, 
      name: "Livraria Lello", 
      location: "Porto, Portugal", 
      image: "https://images.unsplash.com/photo-1603984362497-0a878f607b92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      type: "attractions",
      position: { lat: 41.1473, lng: -8.6151 },
      id:"ChIJTR30n_eXIw0RcrUR5K2DPJI",
      description: "One of the oldest bookstores in Portugal and frequently rated as one of the most beautiful bookstores in the world. It's said to have inspired J.K. Rowling's Harry Potter."
    },
    { 
      key: 3, 
      name: "Disneyland Paris", 
      location: "Paris, France", 
      image: "https://images.unsplash.com/photo-1543158266-0066955977ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
      type: "attractions",
      position: { lat: 48.8673, lng: 2.7813 },
      id:"ChIJTR30n_eXIw0RcrUR5K2DPJI",
      description: "A magical entertainment resort featuring two theme parks, many hotels, and a shopping, dining and entertainment complex."
    },
    { 
      key: 4, 
      name: "Taberna Londrina", 
      location: "London, UK", 
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      type: "restaurants",
      position: { lat: 51.5074, lng: -0.1278 },
      id:"ChIJTR30n_eXIw0RcrUR5K2DPJI",
      description: "A cozy restaurant in central London offering traditional British cuisine with a modern twist, featuring locally sourced ingredients."
    },
  ]);
  const [loading, setLoading] = useState(false);

  // If userTag is provided but doesn't match LoggedUser, fetch that user's info
  useEffect(() => {
    const fetchUserByTag = async () => {
      if (userTag && (!LoggedUser || userTag !== LoggedUser.tag)) {
        try {
          // Fetch user info by tag
          const response = await axiosUser.get(`/user/tag/${userTag}`);
          if (response.data && response.data.response) {
            setViewingUser(response.data.response);
          }
        } catch (error) {
          console.error("Error fetching user by tag:", error);
          // If user not found, redirect to home
          navigate('/');
        }
      } else if (LoggedUser) {
        // If viewing own saved items, set viewingUser to LoggedUser
        setViewingUser(LoggedUser);
      }
    };
    
    if (!isUserLoading) {
      fetchUserByTag();
    }
  }, [userTag, LoggedUser, isUserLoading, navigate]);
  
  const handleToggleSave = (placeId) => {
    if (!isViewingOwnSaved) return;
    
    if (selectedPlace && selectedPlace.id === placeId) {
      setSidebarOpen(false);
      setSelectedPlace(null);
    }

    setSavedPlaces(prev => prev.filter(place => place.id !== placeId));
  };
  
  // Handle clicking on a saved place card
  const handlePlaceClick = (place) => {
    // Add isSaved property to the place data
    const placeWithSavedStatus = {
      ...place,
      isSaved: true
    };
    setSelectedPlace(placeWithSavedStatus);
    setSidebarOpen(true);
  };
  
  // Close the sidebar
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  const filteredPlaces = savedPlaces.filter(place => {
    const matchesSearch = 
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "all" || place.type === activeTab;
    
    return matchesSearch && matchesTab;
  });
  
  const getMarkers = () => {
    return filteredPlaces.map(place => ({
      position: place.position,
      title: place.name
    }));
  };

  const shouldShowSavedPlaces = process.env.NODE_ENV === 'development' || isAuthenticated || userTag;
  
  return (
    <PageTemplate>
      <div className="flex flex-col overflow-hidden">
        <div className="flex">
          <div className="w-4/7">
            <div className="bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-10 mt-[0.6rem] pb-9">
              <div className="flex items-center">
                <FaHeart className="text-primary text-xl mr-3" />
                <h1 className="text-2xl font-bold">
                  {viewingUser 
                    ? (isViewingOwnSaved ? "Saved Places" : `${viewingUser.name}'s Saved Places`) 
                    : "Saved Places"}
                </h1>
              </div>
            </div>
            <div className="ml-4">
              <TabBar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
              />
            </div>
            <div className="px-6 pt-4 overflow-y-auto">
              <div className="mb-4">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  placeholder="Search saved places..."
                  hideButton={true}
                />
              </div>
              
              {isUserLoading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Loading user information...</p>
                </div>
              ) : !shouldShowSavedPlaces ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Please log in to view saved places.</p>
                </div>
              ) : loading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Loading saved places...</p>
                </div>
              ) : filteredPlaces.length === 0 ? (
                <div className="text-center py-10 col-span-full text-gray-500">
                  {isViewingOwnSaved ? 
                    "You don't have any saved places yet. Start saving your favorite destinations!" : 
                    `${viewingUser?.name || 'This user'} doesn't have any saved places to show.`}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredPlaces.map((place) => (
                    <TripCard
                      key={place.key}
                      image={place.image}
                      name={place.name}
                      location={place.location}
                      isSavedPlace={true}
                      isSaved={true}
                      onToggleSave={() => handleToggleSave(place.id)}
                      onCardClick={handlePlaceClick}
                      placeData={place}
                      id={place.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="w-3/7 h-screen relative">
            {/* Map component - hide when sidebar is open */}
            {!sidebarOpen && (
              <Map
                markers={getMarkers()}
              />
            )}
            
            {/* Place Detail Sidebar - moved inside the map container */}
            <PlaceDetailSidebar
              place={selectedPlace}
              isOpen={sidebarOpen}
              onClose={handleCloseSidebar}
              onToggleSave={handleToggleSave}
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default Saved;

