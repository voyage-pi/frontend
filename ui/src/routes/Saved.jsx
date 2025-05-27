import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { axiosUser, axiosPlace } from "../utils/axiosInstance";
import PageTemplate from "../components/PageTemplate";
import { FaHeart } from "react-icons/fa";
import TabBar from "../components/TabBar";
import SearchBar from "../components/SearchBar";
import Map from "../components/Map";
import TripCard from "../components/TripCard";
import PlaceDetailSidebar from "../components/PlaceDetailSidebar";
import placeCategories from '../../public/place_categories.json';

function Saved() {
  const { userTag } = useParams(); // Get userTag from URL params
  const navigate = useNavigate();
  const { LoggedUser, isAuthenticated, isUserLoading } = useAuth();
  
  // Determine if we're viewing our own saved items or someone else's
  const [viewingUser, setViewingUser] = useState(null);
  const isViewingOwnSaved = !userTag || (LoggedUser && userTag === LoggedUser.tag);
  
  // Create tabs from place_categories.json
  const tabs = [
    { value: "all", label: "All places" },
    ...Object.keys(placeCategories).map(category => ({
      value: category.toLowerCase(),
      label: category
    }))
  ];

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for saved places
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoCache, setPhotoCache] = useState({});

  // Feedback notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Function to show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Generate placeholder image as a fallback
  const generatePlaceholderImage = (seed) => {
    const seedStr = typeof seed === "string" ? seed : "place";
    const cleanSeed = seedStr.replace(/[^a-zA-Z0-9]/g, "");
    return `https://picsum.photos/seed/${encodeURIComponent(cleanSeed)}/400/300`;
  };

  // Get photo URL using the same logic as Trips.jsx
  const getPhotoUrl = async (photo) => {
    if (!photo || !photo.name) {
      console.log("No photo available");
      return generatePlaceholderImage("place");
    }

    try {
      // Check if this photo is already in cache
      if (photoCache[photo.name]) {
        return photoCache[photo.name];
      }

      const response = await axiosPlace.post("/places/photo", {
        gRPC: photo.name,
      });

      if (response.status === 429) {
        return getPhotoUrl(photo); // Retry if rate limited
      }

      const photoUrl = response.data?.uri;

      
      // Add to cache
      setPhotoCache(prev => ({
        ...prev,
        [photo.name]: photoUrl
      }));

      return photoUrl;
    } catch (error) {
      console.error("Error fetching photo:", error);
      return generatePlaceholderImage("place");
    }
  };

  // Fetch saved places from the API
  const fetchSavedPlaces = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosUser.get('/places/user/');
      const formattedPlaces = [];
      if (response.data) {
        for (const place of response.data) {
          try {
            const placeDetails = await axiosPlace.get(`/places/${place.place_id}`);
            const placeData = placeDetails.data;
            
            const locationStr = typeof placeData.address === 'string' 
              ? placeData.address 
              : (placeData.formatted_address || 'No address available');
              
            // Get the photo URL
            let photoUrl = generatePlaceholderImage(placeData.name);
            if (placeData.photos && placeData.photos.length > 0) {
              photoUrl = await getPhotoUrl(placeData.photos[0]);
            }
            
            formattedPlaces.push({
              ...placeData,
              key: place.id || place.place_id || Math.random().toString(),
              id: place.place_id,
              location: locationStr,
              position: { 
                lat: placeData.location?.latitude || 0, 
                lng: placeData.location?.longitude || 0 
              },
              image: photoUrl
            });
          } catch (error) {
            console.error(`Error fetching details for place ${place.place_id}:`, error);
          }
        }
        setSavedPlaces(formattedPlaces);
      } else {
        setSavedPlaces([]);
      }
    } catch (error) {
      console.error("Error fetching saved places:", error);
      setSavedPlaces([]);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  // Fetch saved places when authenticated or viewing user changes
  useEffect(() => {
    if (isAuthenticated && !isUserLoading) {
      fetchSavedPlaces();
    }
  }, [isAuthenticated, isUserLoading]);
  
  const handleToggleSave = async (placeId) => {
    if (!isViewingOwnSaved || !isAuthenticated) return;
    
    try {
      // Check if the place is already saved
      const isSaved = savedPlaces.some(place => place.id === placeId);
      
      if (isSaved) {
        // Find place name before removing
        const placeToRemove = savedPlaces.find(place => place.id === placeId);
        const placeName = placeToRemove?.name || 'Place';
        
        await axiosUser.delete('/places/user/favorite', { 
          data: { place_id: placeId } 
        });
        
        setSavedPlaces(prev => prev.filter(place => place.id !== placeId));
        
        if (selectedPlace && selectedPlace.id === placeId) {
          setSidebarOpen(false);
          setSelectedPlace(null);
        }
        
        // Show feedback notification
        
        showNotification(`${placeName} removed from favorites`, 'success');
      } else {
        // Add to favorites
        await axiosUser.post('/places/user/favorite', { 
          place_id: placeId 
        });
        
        // Refresh the saved places list
        fetchSavedPlaces();
        
        // Show feedback notification
        showNotification('Place added to favorites', 'success');
      }
    } catch (error) {
      console.error("Error toggling saved place:", error);
      showNotification('Failed to update favorites', 'error');
    }
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
      (place.name && place.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (place.location && typeof place.location === 'string' && place.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === "all") {
      return matchesSearch;
    }

    // Check if place types match the selected category
    const selectedCategory = activeTab.charAt(0).toUpperCase() + activeTab.slice(1); // Capitalize first letter
    const categoryTypes = placeCategories[selectedCategory] || [];
    
    const matchesTab = place.types && place.types.some(type => 
      categoryTypes.includes(type.toLowerCase())
    );
    
    return matchesSearch && matchesTab;
  });
  
  const getMarkers = () => {
    console.log("fileted places",filteredPlaces)
    return filteredPlaces.map(place => ({
      position: place.position || { lat: 0, lng: 0 },
      title: place.name || 'Unknown Place',
      image: place.image || generatePlaceholderImage(place.name)
    }));
  };

  const shouldShowSavedPlaces = process.env.NODE_ENV === 'development' || isAuthenticated || userTag;
  
  return (
    <PageTemplate>
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-md shadow-md transition-opacity duration-300
          ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </div>
      )}

      <div className="flex flex-col overflow-hidden">
        <div className="flex">
          <div className="w-4/7 relative z-20">
            <div className="bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-20 mt-[0.6rem] pb-9">
              <div className="flex items-center">
                <FaHeart className="text-primary text-xl mr-3" />
                <h1 className="text-2xl font-bold">
                  {viewingUser 
                    ? (isViewingOwnSaved ? "Saved Places" : `${viewingUser.name}'s Saved Places`) 
                    : "Saved Places"}
                </h1>
              </div>
            </div>
            <div className="ml-4 relative z-20">
              <TabBar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
                className="z-20"
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
                <div className="flex flex-wrap gap-x-8 gap-y-4 pb-8 overflow-visible justify-start items-center">
                  {filteredPlaces.map((place) => (
                    <TripCard
                      key={place.key || place.id || Math.random().toString()}
                      image={place.image}
                      name={place.name || "Unnamed Place"}
                      location={typeof place.location === 'string' ? place.location : "No address available"}
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
          
          <div className="w-3/7 h-screen relative z-10">
            {/* Map component - hide when sidebar is open */}
            {!sidebarOpen && (
              <Map
                markers={getMarkers()}
                className="z-10"
              />
            )}
            
            {/* Place Detail Sidebar - moved inside the map container */}
            <PlaceDetailSidebar
              place={selectedPlace}
              isOpen={sidebarOpen}
              onClose={handleCloseSidebar}
              onToggleSave={handleToggleSave}
              className="z-10"
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

export default Saved;

