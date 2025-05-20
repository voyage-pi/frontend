import React, { useRef, useState, useEffect } from "react";
import { axiosPlace } from "../../../utils/axiosInstance";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaSistrix } from "react-icons/fa6";
import RangeSlider from "../../RangeSlider";
import Map from "../../Map";
import { ToastContainer } from "react-toastify";
import Notification from "../../Notification";
import LoadingAnimation from "../../LoadingAnimation";

const ZoneTripContent = () => {
  const [circle, setCircle] = useState([]);
  const [radius, setRadius] = useState(100);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [suggestionlist, setSuggestionList] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestionHovered, setSuggestionHovered] = useState(-1);
  const [notify, setNotify] = useState();
  const [markers, setMarkers] = useState([]);
  const timeoutRef = useRef(null);
  const handleSelectLocation = async (location) => {
    setSelectedLocation(location);
    setCurrentText(location);

    try {
      const response = await axiosPlace.post("/search/", {
        place_name: location,
      });
      let m = {
        position: {
          lat: response.data.latitude,
          lng: response.data.longitude,
        },
        title: location,
        address: "",
        image: "",
      };

      setCircle([
        {
          radius: radius,
          center: {
            lat: response.data.latitude,
            lng: response.data.longitude,
          },
        },
      ]);

      localStorage.setItem("Longitude", response.data.longitude);
      localStorage.setItem("Latitude", response.data.latitude);
      setMarkers([m]);
    } catch (error) {
      setNotify({
        type: "error",
        text: `There was an error ${error}`,
        key: Date.now(),
      });
      console.error("Search error:", error);
    }
    localStorage.setItem("Location", location);
  };

  const handleRadiusChange = (radius) => {
    setRadius(radius);
    localStorage.setItem("radius", radius);
    if (circle.length !== 0) {
      setCircle([{ ...circle[0], radius: radius }]);
    }

    localStorage.setItem("Budget", radius);
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem("Location");
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }
  }, []);

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
        text: `There was an error ${error}`,
        key: Date.now(),
      });
      console.error("Search error:", error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLoading(value !== "");
    setCurrentText(value);
    if (value == "") {
      return 0;
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
    if (suggestionlist.length === 0) return;
    let key = event.key;
    let suggestionsL = suggestionlist.length != 0 ? suggestionlist.length : 1;
    if (key === "ArrowDown") {
      setSuggestionHovered((prev) => (prev + 1) % suggestionsL);
    } else if (key === "ArrowUp") {
      setSuggestionHovered(
        (prev) => ((prev <= 0 ? suggestionsL : prev) - 1) % suggestionsL
      );
    } else if (key === "Enter") {
      let currentSelectedSuggestion = suggestionlist[suggestionHovered];
      handleSelectLocation(currentSelectedSuggestion.text);
    }
  };

  const MouseHover = (idx) => {
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
              onKeyDown={handleSuggestionsSelection}
              onChange={handleInputChange}
              value={currentText}
              type="text"
              className="pl-10 p-3 w-full border border-gray-200 rounded-lg focus:outline-none"
              placeholder="Barcelona"
            />
          </div>

          <div className="space-y-3 text-center">
            {currentText.length > 3 ? (
              loading ? (
                <div className=" flex justify-center">
                  <LoadingAnimation width={"150px"} height={"150px"} />
                </div>
              ) : (
                <>
                  <RangeSlider
                    value={radius}
                    onChange={handleRadiusChange}
                    min={0}
                    max={10000}
                    step={100}
                    currency="m"
                    rangeClassName="range range-primary range-sm"
                    valueClassName="text-primary text-5xl font-bold mb-6"
                    variant="compact"
                  />
                  {suggestionlist.map((location, idx) => (
                    <div
                      onMouseEnter={() => MouseHover(idx)}
                      onMouseLeave={() => setSuggestionHovered(-1)}
                      key={location.place_id}
                      className={`transition-all ease-in-out flex items-center p-3 rounded-lg text-lg cursor-pointer ${
                        location.text === selectedLocation
                          ? "bg-primary text-white"
                          : "bg-gray-50"
                      }
                     ${
                       suggestionHovered === idx && selectedLocation != location
                         ? "translate-x-2 border-primary border-1"
                         : ""
                     } 
                      
`}
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
                  ))}
                </>
              )
            ) : (
              <div className="w-full text-primary opacity-50 text-center my-3">
                Insert a location that you would like to visit...
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-blue-50 rounded-lg overflow-hidden h-109 flex-col -mb-10">
          <Map markers={markers} circles={circle} />
        </div>
      </div>
    </div>
  );
};

export default ZoneTripContent;
