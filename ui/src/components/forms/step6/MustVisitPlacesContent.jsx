import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaTrash } from "react-icons/fa";
import { FaSistrix } from "react-icons/fa6";
import { axiosPlace } from "../../../utils/axiosInstance";
import LoadingAnimation from "../../LoadingAnimation";

const MustVisitPlacesContent = () => {
  const [suggestionlist, setSuggestionList] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestionHovered, setSuggestionHovered] = useState(-1);
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
        place_id: response.data.place_id,
      };

      console.log("New place added:", newPlace);

      setMustVisitPlaces(prev => [...prev, newPlace]);
      setCurrentText("");
      setSuggestionList([]);
    } catch (error) {
      console.error("Add place error:", error);
    }
  };

  const removePlace = (placeName) => {
    setMustVisitPlaces(prev => prev.filter(place => place.name !== placeName));
  };

  const autocompleteSearch = async () => {
    try {
      const response = await axiosPlace.post("/places/autocomplete", {
        input: currentText,
      });
      setSuggestionList(response.data.suggestions_list);
      setLoading(false);
    } catch (error) {
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

  const getPlaceHeightClass = () => {
    const count = mustVisitPlaces.length;
    if (count === 0) return "";
    if (count === 1) return "h-1/2";
    if (count === 2) return "h-1/2";
    if (count === 3) return "h-1/3";
    return "h-1/3";
  };

  const shouldAddScroll = mustVisitPlaces.length > 3;

  return (
    <div className="h-[25rem]">
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

        {/* Right Side - Must Visit Places Box */}
        <div className="flex-1">
          <div className=" h-84 w-full overflow-hidden">
            {mustVisitPlaces.length === 0 ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center text-gray-500">
                  No must-visit places added yet.
                </div>
              </div>
            ) : (
              <div className={`flex flex-col gap-y-4 ${shouldAddScroll ? 'overflow-y-auto' : ''} h-full w-full`}>
                {mustVisitPlaces.map((place, index) => (
                  <div
                    key={index}
                    className={`rounded-lg overflow-hidden border border-gray-200 relative flex w-full ${getPlaceHeightClass()} ${index > 0 ? 'border-t' : ''}`}
                  >
                    <div className="p-4 w-3/4 flex items-center">
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
    </div>
  );
};

export default MustVisitPlacesContent;
