import React, { useState } from "react";
import PageTemplate from "../components/PageTemplate";
import { FaCamera, FaEye, FaEyeSlash, FaUserCircle, FaImage, FaEdit } from "react-icons/fa";
import userData from "../../public/user.json";
import Notification from "../components/Notification";

function Settings() {
  const [profileImage, setProfileImage] = useState(userData.image);
  const [bannerImage, setBannerImage] = useState(null);
  const [bio, setBio] = useState(userData.bio || "Travel enthusiast");
  const [hideTrips, setHideTrips] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        showNotification("Profile image updated", "info");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result);
        showNotification("Banner image updated", "info");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBioChange = (e) => {
    setBio(e.target.value);
  };
  
  const handleToggleTripsVisibility = () => {
    setHideTrips(!hideTrips);
    showNotification(hideTrips ? "Trips are now visible to friends" : "Trips are now hidden from friends", "info");
  };
  
  const handleSaveChanges = (e) => {
    e.preventDefault();
    
    try {
      //api call
      showNotification("Profile settings saved successfully!", "success");
    } catch (error) {
      showNotification("Failed to save settings: " + error.message, "error");
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

  return (
    <PageTemplate>
      <div className="h-screen flex flex-col overflow-auto">
        <div className="bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-10 mt-3">
          <div className="flex items-center">
            <FaUserCircle className="text-primary text-xl mr-3" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
        
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSaveChanges}>
              {/* Banner Image Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Banner Image</h2>
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
              <div className="mb-8 flex flex-col md:flex-row items-start gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={userData.name} 
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
                  <h2 className="text-lg font-medium mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        defaultValue={userData.name}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        defaultValue={userData.tag}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Bio</h2>
                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={handleBioChange}
                    placeholder="Tell others about yourself..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
                  />
                  <div className="absolute bottom-3 right-3 text-gray-400 text-sm">
                    {bio.length}/250
                  </div>
                </div>
              </div>
              
              {/* User Stats Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">User Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="font-bold text-2xl text-primary">{userData.stats.trips}</div>
                    <div className="text-gray-600">Trips</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="font-bold text-2xl text-primary">{userData.stats.friends}</div>
                    <div className="text-gray-600">Friends</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="font-bold text-2xl text-primary">{userData.stats.countries}</div>
                    <div className="text-gray-600">Countries</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="font-bold text-2xl text-primary">{userData.stats.saved}</div>
                    <div className="text-gray-600">Saved</div>
                  </div>
                </div>
              </div>
              
              {/* Privacy Settings */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Privacy Settings</h2>
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
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Notification */}
        {notification && (
          <Notification 
            key={notification.key}
            type={notification.type} 
            text={notification.text}
            onClose={() => setNotification(null)}
            options={{ 
              position: "top-right",
              autoClose: 3000,
              pauseOnHover: false
            }}
          />
        )}
      </div>
    </PageTemplate>
  );
}

export default Settings; 