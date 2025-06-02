import React, { useState, useEffect } from "react";
import PageTemplate from "../components/PageTemplate";
import { FaCamera, FaEye, FaEyeSlash, FaImage, FaUserCircle } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

import { axiosUser } from "../utils/axiosInstance";
import Notification from "../components/Notification";
import { useAuth } from "../context/AuthContext";

// Fallback user data when API is not available
const defaultUserData = {
  name: "John Doe",
  tag: "@johndoe",
  image: null,
  bannerImage: null,
  bio: "Travel enthusiast",
  hideTrips: false,
  stats: {
    trips: 0,
    countries: 0,
    cities: 0,
    saved: 0,
    friends: 0
  }
};

function Settings() {
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bio, setBio] = useState("");
  const [hideTrips, setHideTrips] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");

  // Get auth context
  const { 
    LoggedUser, 
    isAuthenticated,
    loadUserData
  } = useAuth();

  useEffect(() => {
    // If user data exists in context, initialize the component
    if (LoggedUser) {
      initializeWithUserData(LoggedUser);
    } else {
      // If not authenticated or no user data, load it
      loadUserData();
    }
  }, [LoggedUser, loadUserData]);

  // Initialize component state with user data
  const initializeWithUserData = (userData) => {
    setProfileImage(userData.avatar_url || userData.image);
    setBannerImage(userData.banner_url || userData.bannerImage);
    setBio(userData.bio || "");
    setHideTrips(!userData.show_trips);
    setName(userData.name || "");
    setTag(userData.tag || "");
    setIsLoading(false);
    
    // Debug
     ;
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        showNotification("Profile image selected. Save changes to update.", "info");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result);
        showNotification("Banner image selected. Save changes to update.", "info");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBioChange = (e) => {
    setBio(e.target.value);
  };
  
  const handleToggleTripsVisibility = () => {
    setHideTrips(!hideTrips);
    showNotification(hideTrips ? "Trips visibility changed. Save changes to update." : "Trips visibility changed. Save changes to update.", "info");
  };
  
  const uploadProfileImage = async () => {
    if (!profileImageFile || !LoggedUser) return null;
    
    const formData = new FormData();
    formData.append('avatar', profileImageFile);
    
    try {
      const response = await axiosUser.patch(`/user/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
       ;
      throw new Error("Failed to upload profile image");
    }
  };
  
  const uploadBannerImage = async () => {
    if (!bannerImageFile || !LoggedUser) return null;
    
    const formData = new FormData();
    formData.append('banner', bannerImageFile);
    
    try {
      const response = await axiosUser.patch(`/user/banner`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
       ;
      throw new Error("Failed to upload banner image");
    }
  };
  
  const updateUserBio = async () => {
    if (!LoggedUser) return null;
    
    try {
      const response = await axiosUser.patch(`/user/user-update`, {
        bio: bio,
        show_trips: !hideTrips,
        name: name,
        tag: tag
      });
      
      return response.data;
    } catch (error) {
       ;
      throw new Error("Failed to update user bio");
    }
  };
  
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    if (!LoggedUser) {
      showNotification("User data not available", "error");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create an array to store all update operations
      const updateOperations = [];
      
      // Only add profile image upload if a new file was selected
      if (profileImageFile) {
        updateOperations.push(uploadProfileImage());
      }
      
      // Only add banner image upload if a new file was selected
      if (bannerImageFile) {
        updateOperations.push(uploadBannerImage());
      }
      
      // Always update bio, as it might have changed
      updateOperations.push(updateUserBio());
      
      // Wait for all operations to complete
      await Promise.all(updateOperations);
      
      // Reload user data to get the updated profile
      await loadUserData();
      
      showNotification("Profile settings saved successfully!", "success");
      
      // Clear file states after successful upload
      setProfileImageFile(null);
      setBannerImageFile(null);
    } catch (error) {
      showNotification("Failed to save settings: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };
  
  const showNotification = (message, type = "info") => {
    setNotification({
      text: message,
      type: type,
      key: Date.now()
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  if (isLoading || !LoggedUser) {
    return (
      <PageTemplate>
        <div className="h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      <div className="h-screen flex flex-col overflow-auto">
        <div className="bg-white pt-[1.9rem] px-6 flex fixed w-full items-center justify-between z-20">
          <div className="flex items-center">
            <FaGear className="text-primary text-xl mr-3" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
        
        <div className="flex-1 p-4 md:p-6 mt-18">
          <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSaveChanges}>
              {/* Banner Image Section */}
              <div className="mb-8">
                <h2 className="text-lg font-black mb-4">Profile Information</h2>
                <div className="w-full h-48 bg-gray-200 rounded-lg relative overflow-hidden">
                  {bannerImage ? (
                    <img 
                      src={bannerImage} 
                      alt="Banner" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FaImage className="text-gray-400 text-4xl" />
                    </div>
                  )}
                  <label className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full cursor-pointer hover:bg-white shadow-md">
                    <FaCamera className="text-primary" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleBannerImageChange} 
                    />
                  </label>
                </div>
              </div>
              
              {/* Profile Image Section */}
              <div className="mb-8 flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={LoggedUser.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FaUserCircle className="text-gray-400 text-5xl" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full cursor-pointer hover:bg-gray-50 shadow-md">
                    <FaCamera className="text-primary" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfileImageChange}
                    />
                  </label>
                </div>
                
                <div className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                      <input
                        type="text"
                        value={tag}
                        onChange={e => setTag(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio Section */}
              <div className="mb-8">
                <h2 className="text-lg font-black mb-4">Biography</h2>
                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={handleBioChange}
                    placeholder="Tell others about yourself..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
                    maxLength={250}
                  />
                  <div className="absolute bottom-3 right-3 text-gray-400 text-sm">
                    {bio.length}/250
                  </div>
                </div>
              </div>
              
              {/* User Stats Section */}
              <div className="mb-8">
                <h2 className="text-lg font-black mb-4">Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="font-bold text-2xl text-secondary">{LoggedUser.stats?.trips || 0}</div>
                    <div className="text-gray-600">Trips</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="font-bold text-2xl text-secondary">{LoggedUser.stats?.countries || 0}</div>
                    <div className="text-gray-600">Countries</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="font-bold text-2xl text-secondary">{LoggedUser.stats?.cities || 0}</div>
                    <div className="text-gray-600">Cities</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="font-bold text-2xl text-secondary">{LoggedUser.stats?.saved || 0}</div>
                    <div className="text-gray-600">Saved Places</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="font-bold text-2xl text-secondary">{LoggedUser.stats?.friends || 0}</div>
                    <div className="text-gray-600">Friends</div>
                  </div>
                </div>
              </div>
              
              {/* Privacy Settings */}
              <div className="mb-8">
                <h2 className="text-lg font-black mb-4">Privacy Settings</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Hide Trips from Friends</h3>
                      <p className="text-gray-500 text-sm">When enabled, your trips won't be visible to your friends</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleTripsVisibility}
                      className={`p-2 rounded-full ${hideTrips ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {hideTrips ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="mt-12 flex justify-end">
                <button
                  type="submit"
                  className={`bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors flex items-center ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Notification */}
        {notification && (
          <Notification 
            type={notification.type} 
            text={notification.text}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </PageTemplate>
  );
}

export default Settings; 