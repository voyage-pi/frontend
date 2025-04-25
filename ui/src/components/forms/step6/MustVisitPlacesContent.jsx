import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaTrash } from "react-icons/fa";
import { FaSistrix } from "react-icons/fa6";
import { axiosPlace } from "../../../utils/axiosInstance";
import LoadingAnimation from "../../LoadingAnimation";
import Notification from "../../Notification";
import { ToastContainer } from "react-toastify";

const MustVisitPlacesContent = () => {
  const [suggestionlist, setSuggestionList] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestionHovered, setSuggestionHovered] = useState(-1);
  const [notify, setNotify] = useState();
  const [mustVisitPlaces, setMustVisitPlaces] = useState([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const savedPlaces = JSON.parse(localStorage.getItem("MustVisitPlaces")) || [];
    if (savedPlaces.length > 0) {
      setMustVisitPlaces(savedPlaces);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("MustVisitPlaces", JSON.stringify(mustVisitPlaces));
  }, [mustVisitPlaces]);

  const addPlace = async (placeName) => {
    if (mustVisitPlaces.some(place => place.name === placeName)) {
      setNotify({
        type: "warning",
        text: `${placeName} is already in your must-visit list`,
        key: Date.now()
      });
      return;
    }

    try {
      const response = await axiosPlace.post("/search/", {
        place_name: placeName,
      });

      const newPlace = {
        name: placeName,
        position: {
          lat: response.data.latitude,
          lng: response.data.longitude,
        },
        image: response.data.image || `https://source.unsplash.com/400x300/?${encodeURIComponent(placeName)}`,
      };

      setMustVisitPlaces(prev => [...prev, newPlace]);
      setCurrentText("");
      setSuggestionList([]);

      setNotify({
        type: "success",
        text: `${placeName} added to your must-visit list`,
        key: Date.now()
      });
    } catch (error) {
      setNotify({
        type: "error",
        text: `There was an error adding ${placeName}: ${error}`,
        key: Date.now()
      });
      console.error("Add place error:", error);
    }
  };

  const removePlace = (placeName) => {
    setMustVisitPlaces(prev => prev.filter(place => place.name !== placeName));
    setNotify({
      type: "info",
      text: `${placeName} removed from your must-visit list`,
      key: Date.now()
    });
  };

  const autocompleteSearch = async () => {
    try {
      const response = await axiosPlace.post("/places/autocomplete", {
        input: currentText,
      });
      setSuggestionList(response.data.suggestions_list);
      setLoading(false);
    } catch (error) {
      setNotify({
        type: "error",
        text: `Search error: ${error}`,
        key: Date.now()
      });
      console.error("Search error:", error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLoading(value !== "");
    setCurrentText(value);
    
    if (value === "") {
      setSuggestionList([]);
      return;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length > 2) {
      timeoutRef.current = setTimeout(() => {
        autocompleteSearch();
      }, 1200);
    }
  };

  const handleSuggestionsSelection = (event) => {
    if (suggestionlist.length === 0)
      return;
      
    let key = event.key;
    let suggestionsL = suggestionlist.length || 1;
    
    if (key === "ArrowDown") {
      setSuggestionHovered(prev => (prev + 1) % suggestionsL);
    }
    else if (key === "ArrowUp") {
      setSuggestionHovered(prev => ((prev <= 0 ? suggestionsL : prev) - 1) % suggestionsL);
    }
    else if (key === "Enter") {
      if (suggestionHovered >= 0 && suggestionHovered < suggestionlist.length) {
        addPlace(suggestionlist[suggestionHovered].text);
      }
    }
  };

  const handleMouseHover = (idx) => {
    setSuggestionHovered(idx);
  };

  return (
    <div>
      <ToastContainer />

      {notify && (
        <Notification
          key={notify.key}
          type={notify.type}
          text={notify.text}
          onClose={() => setNotify(null)}
          options={{
            position: "top-right",
            autoClose: 3000,
            pauseOnHover: false,
          }}
        />
      )}
      
      <h2 className="text-3xl mb-10 text-center">
        Add <span className="text-primary">places</span> you must visit!
      </h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side - Search Section */}
        <div className="flex-1">
          {/* Search Box */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FaSistrix className="text-gray-400 text-xl" />
            </div>
            <input
              onKeyDown={handleSuggestionsSelection}
              onChange={handleInputChange}
              value={currentText}
              type="text"
              className="pl-10 p-3 w-full border border-gray-200 rounded-lg focus:outline-none"
              placeholder="Search for a place to add..."
            />
          </div>

          {/* Suggestions List */}
          <div className="space-y-3 text-center">
            {currentText.length > 3 ? (
              loading ? (
                <div className="flex justify-center">
                  <LoadingAnimation width={"150px"} height={"150px"} />
                </div>
              ) : (
                suggestionlist.map((location, idx) => (
                  <div
                    onMouseEnter={() => handleMouseHover(idx)}
                    onMouseLeave={() => setSuggestionHovered(-1)}
                    key={location.place_id}
                    className={`transition-all ease-in-out flex items-center p-3 rounded-lg text-lg cursor-pointer ${
                      suggestionHovered === idx ? "translate-x-2 border-primary border-1" : ""
                    } bg-gray-50`}
                    onClick={() => addPlace(location.text)}
                  >
                    <FaMapMarkerAlt className="mr-3 text-primary" />
                    <span>{location.text}</span>
                  </div>
                ))
              )
            ) : (
              <div className="w-full text-primary opacity-50 text-center my-3">
                Start typing to search for places you must visit...
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Must Visit Places */}
        <div className="flex-1">          
          {mustVisitPlaces.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No must-visit places added yet. Start searching and add places you don't want to miss!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[500px]">
              {mustVisitPlaces.map((place, index) => (
                <div key={index} className="rounded-lg shadow-md overflow-hidden border border-gray-200 relative">
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    <img 
                      src={place.image} 
                      alt={place.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-medium">{place.name}</h4>
                    <button 
                      onClick={() => removePlace(place.name)}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-100 transition-colors"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MustVisitPlacesContent; 