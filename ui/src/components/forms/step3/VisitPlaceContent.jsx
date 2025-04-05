import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaSistrix } from "react-icons/fa6";
import Map from "../../Map";
import { axiosPlace } from "../../../utils/axiosInstance";
import LoadingAnimation from "../../LoadingAnimation";
import { ToastContainer } from "react-toastify";
import Notification from "../../Notification";

const VisitPlaceContent = () => {
  const [selectedLocation, setSelectedLocation] = useState("Barcelona");
  const [suggestionlist, setSuggestionList] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [notify,setNotify] =useState()
  const [markers, setMarkers] = useState([]);
  const timeoutRef = useRef(null);

  const handleSelectLocation = async (location) => {
    setSelectedLocation(location);
    setCurrentText(location);

    try {
      const response = await axiosPlace.post("/search/", {
        place_name: location,
      });
      console.log(response.data);
      let m = {
        position: {
          lat: response.data.latitude,
          lng: response.data.longitude,
        },
        title: location,
        address: "",
        image: "",
      };
      console.log(m);
      localStorage.setItem("Longitude", response.data.longitude);
      localStorage.setItem("Latitude", response.data.latitude);
      setMarkers([m]);
    } catch (error) {
      setNotify({
        type: 'error',
        text: `There was an error ${error}`,
        key: Date.now() 
      })
      console.error("Search error:", error);
    }
    localStorage.setItem("Location", location);
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem("Location");
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }
    //clean up timeout when the component unmounts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const autocompleteSearch = async () => {
    try {
      const response = await axiosPlace.post("/places/autocomplete", {
        input: currentText,
      });
      setSuggestionList(response.data.suggestions_list);
      setLoading(false);
      // Here you can handle the response, for example updating the locations list
      // based on the API response
    } catch (error) {
      setNotify({
        type: 'error',
        text: `There was an error ${error}`,
        key: Date.now() 
      })
      console.error("Search error:", error);
    }
  };

  // Handle input changes with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLoading(value!=="");
    setCurrentText(value);
    if(value=="")
    {
      //to avoid making requests to the backend for a null string
      return 0
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length > 2) {
      // Only search if there are at least 3 characters
      timeoutRef.current = setTimeout(() => {
        autocompleteSearch();
      }, 1200); 
    }
  };

  return (
    <div>
       <ToastContainer />
      
      {notify && (
        <Notification 
          key={notify.key}
          type={notify.type} 
          text={notify.text}
          onClose={()=>setNotify(null)}
          options={{ 
            position: "top-right",
            autoClose: 3000,
            pauseOnHover: false
          }}
        />
      )} 
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side - Location Selection */}
        <div className="flex-1">
          <h2 className="text-3xl mb-10 text-center">
            Choose a <span className="text-primary">location</span> to go to!
          </h2>
          {/* Search Box */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FaSistrix className="text-gray-400 text-xl" />
            </div>
            <input
              onChange={handleInputChange}
              value={currentText}
              type="text"
              className="pl-10 p-3 w-full border border-gray-200 rounded-lg focus:outline-none"
              placeholder="Barcelona"
            />
          </div>

          <div className="space-y-3 text-center">
            {!loading ? (
              currentText === "" ? (
                <div className="w-full text-primary opacity-50 text-center my-3">
                  Insert a location that you would like to visit...
                </div>
              ) : (
                suggestionlist.map((location) => (
                  <div
                    key={location.place_id}
                    className={`flex items-center p-3 rounded-lg text-lg cursor-pointer ${
                      location.text === selectedLocation
                        ? "bg-primary text-white"
                        : "bg-gray-50"
                    }`}
                    onClick={() => handleSelectLocation(location.text)}
                  >
                    <FaMapMarkerAlt
                      className={`mr-3 ${
                        location.text === selectedLocation
                          ? "text-white"
                          : "text-primary"
                      }`}
                    />
                    <span>{location.text}</span>
                  </div>
                ))
              )
            ) : (
              <div className=" flex justify-center">
                <LoadingAnimation />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-blue-50 rounded-lg overflow-hidden h-109 flex-col -mb-10">
          <Map markers={markers} />
        </div>
      </div>
    </div>
  );
};

export default VisitPlaceContent;
