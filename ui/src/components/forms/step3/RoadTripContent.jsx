import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaSistrix } from "react-icons/fa6";
import { RiRoadMapLine, RiRoadsterLine } from "react-icons/ri";
import Map from "../../Map";
import { axiosMaps, axiosPlace } from "../../../utils/axiosInstance";
import LoadingAnimation from "../../LoadingAnimation";
import { ToastContainer } from "react-toastify";
import Notification from "../../Notification";
import { motion } from "motion/react";
import { AnimatePresence, calcLength } from "framer-motion";

const RoadTripContent = () => {
  const [selectedLocationOrigin, setSelectedLocationOrigin] = useState("");
  const [selectedLocationDes, setSelectedLocationDes] = useState("");
  const [suggestionlistOrigin, setSuggestionListOrigin] = useState([]);
  const [suggestionlistDes, setSuggestionListDes] = useState([]);
  const [currentTextOrigin, setCurrentTextOrigin] = useState("");
  const [currentTextDes, setCurrentTextDes] = useState("");
  const [loadingOrigin, setLoadingOrigin] = useState(false);
  const [loadingDes, setLoadingDes] = useState(false);
  const [suggestionHoveredOrigin, setSuggestionHoveredOrigin] = useState(-1);
  const [suggestionHoveredDes, setSuggestionHoveredDes] = useState(-1);
  const [notify, setNotify] = useState();
  const [markersOrigin, setMarkersOrigin] = useState([]);
  const [markersDes, setMarkersDes] = useState([]);
  const timeoutRef = useRef(null);
  const [showOrigin, setShowOrigin] = useState(true);
  const [showDes, setShowDes] = useState(true);
  const [route, setRoute] = useState([]);
  useEffect(() => {
    const routing = async () => {
      if (markersOrigin.length > 0 && markersDes.length > 0) {
        console.log("Both markers are set");
        let originR = {
          latitude: markersOrigin[0].position.lat,
          longitude: markersOrigin[0].position.lng,
        };
        let destinationR = {
          latitude: markersDes[0].position.lat,
          longitude: markersDes[0].position.lng,
        };
        const response = await axiosMaps.post("/maps/", {
          origin: originR,
          destination: destinationR,
          travelingMode: "DRIVE",
        });
        console.log(response.data.routes);
        setRoute(response.data.routes);
        //store the origin and destination in local storage such has the route
        localStorage.setItem(
          "Location",
          "Driving from " + currentTextOrigin + " to " + currentTextDes
        );
        localStorage.setItem("route", response.data.routes[0].polylineEncoded);
      }
    };
    routing();
  }, [markersDes, markersOrigin]);

  const handleSelectLocation = async (location, origin) => {
    if (origin) {
      setSelectedLocationOrigin(location);
      setCurrentTextOrigin(location.text);
      setShowOrigin(false);
    } else {
      setSelectedLocationDes(location);
      setCurrentTextDes(location.text);
      setShowDes(false);
    }

    try {
      const response = await axiosPlace.post("/search/", {
        place_name: location.text,
      });
      let m = {
        position: {
          lat: response.data.latitude,
          lng: response.data.longitude,
        },
        title: location.text,
        address: "",
        image: "",
      };
      if (origin) {
        localStorage.setItem(
          "origin",
          JSON.stringify({
            id: location.place_id,
            name: location.text,
            types: [],
            location: {
              latitude: m.position.lat,
              longitude: m.position.lng,
            },
          })
        );
        setMarkersOrigin([m]);
      } else {
        localStorage.setItem(
          "destination",
          JSON.stringify({
            id: location.place_id,
            name: location.text,
            types: [],
            location: {
              latitude: m.position.lat,
              longitude: m.position.lng,
            },
          })
        );
        setMarkersDes([m]);
      }
    } catch (error) {
      setNotify({
        type: "error",
        text: `There was an error ${error}`,
        key: Date.now(),
      });
      console.error("Search error:", error);
    }
  };
  const autocompleteSearch = async (origin) => {
    try {
      const response = await axiosPlace.post("/places/autocomplete", {
        input: origin ? currentTextOrigin : currentTextDes,
      });
      if (origin) {
        setSuggestionListOrigin(response.data.suggestions_list);
      } else {
        setSuggestionListDes(response.data.suggestions_list);
      }

      origin ? setLoadingOrigin(false) : setLoadingDes(false);
      // Here you can handle the response, for example updating the locations list
      // based on the API response
    } catch (error) {
      setNotify({
        type: "error",
        text: `There was an error ${error}`,
        key: Date.now(),
      });
      console.error("Search error:", error);
    } finally {
      origin ? setLoadingOrigin(false) : setLoadingDes(false);
    }
  };

  // Handle input changes with debounce
  const handleInputChange = (e, origin) => {
    const value = e.target.value;
    origin ? setLoadingOrigin(value !== "") : setLoadingDes(value !== "");
    origin ? setShowOrigin(true) : setShowDes(true);
    origin ? setCurrentTextOrigin(value) : setCurrentTextDes(value);
    if (value == "") {
      //to avoid making requests to the backend for a null string
      origin ? setSuggestionListOrigin([]) : setSuggestionListDes([]);
      origin ? setSelectedLocationOrigin(null) : setSelectedLocationDes(null);
      return 0;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length > 2) {
      timeoutRef.current = setTimeout(() => {
        autocompleteSearch(origin);
      }, 1200);
    }
  };

  const handleSuggestionsSelection = (event, origin) => {
    let suggestionlist = origin ? suggestionlistOrigin : suggestionlistDes;

    if (suggestionlist.length === 0) return;
    let key = event.key;
    let suggestionsL = suggestionlist.length != 0 ? suggestionlist.length : 1;
    if (key === "ArrowDown") {
      origin
        ? setSuggestionHoveredOrigin((prev) => (prev + 1) % suggestionsL)
        : setSuggestionHoveredDes((prev) => (prev + 1) % suggestionsL);
    } else if (key === "ArrowUp") {
      origin
        ? setSuggestionHoveredOrigin(
            (prev) => ((prev <= 0 ? suggestionsL : prev) - 1) % suggestionsL
          )
        : setSuggestionHoveredDes(
            (prev) => ((prev <= 0 ? suggestionsL : prev) - 1) % suggestionsL
          );
    } else if (key === "Enter") {
      let currentSelectedSuggestion =
        suggestionlist[origin ? suggestionHoveredOrigin : suggestionHoveredDes];
      handleSelectLocation(currentSelectedSuggestion, origin);
    }
  };

  const MouseHover = (idx, origin) => {
    origin ? setSuggestionHoveredOrigin(idx) : setSuggestionHoveredDes(idx);
  };
  return (
    <>
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
      <div className="w-full p-3 h-full grid grid-cols-2 gap-y-5 gap-x-3">
        <div className="w-full flex justify-center ">
          <div className="relative  w-full grid ">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <RiRoadsterLine className="text-gray-400 text-xl" />
            </div>
            <input
              onKeyDown={(event) => handleSuggestionsSelection(event, true)}
              onChange={(event) => handleInputChange(event, true)}
              value={currentTextOrigin}
              type="text"
              className="pl-10 p-3 w-full border border-gray-200 rounded-lg focus:outline-none"
              placeholder="Origin"
            />

            {loadingOrigin && currentTextOrigin.length > 3 && (
              <div className="absolute right-2 top-1/2 translate-y-[-50%] rounded-md">
                <LoadingAnimation width={"40px"} height={"40px"} />
              </div>
            )}
            <div
              className={`${
                showOrigin ? "" : "hidden"
              } absolute left-0 top-[100%] z-10 w-full grid grid-cols-1 gap-y-1 px-2 max-h-200px overflow-y-auto `}
            >
              <AnimatePresence mode="wait">
                {suggestionlistOrigin.map((location, idx) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: idx * 0.1,
                    }}
                    onMouseEnter={() => MouseHover(idx, true)}
                    onMouseLeave={() => setSuggestionHoveredOrigin(-1)}
                    key={location.place_id}
                    className={`transition-all ease-in-out flex items-center p-3 w-full rounded-lg text-lg cursor-pointer ${
                      location.text === selectedLocationOrigin
                        ? "bg-primary text-white"
                        : "bg-gray-50"
                    }
                      ${
                        suggestionHoveredOrigin === idx &&
                        selectedLocationOrigin != location
                          ? "translate-x-2 border-primary border-1"
                          : ""
                      } 
                        
  `}
                    onClick={() => handleSelectLocation(location, true)}
                  >
                    <FaMapMarkerAlt
                      className={`mr-3 ${
                        location.text === selectedLocationOrigin
                          ? "text-white"
                          : "text-primary"
                      }`}
                    />
                    <span>{location.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="relative w-full  grid">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <RiRoadMapLine className="text-gray-400 text-xl" />
            </div>
            <input
              onKeyDown={(event) => handleSuggestionsSelection(event, false)}
              onChange={(event) => handleInputChange(event, false)}
              value={currentTextDes}
              type="text"
              className="pl-10 p-3 w-full border border-gray-200 rounded-lg focus:outline-none"
              placeholder="Destination"
            />
            {loadingDes && currentTextDes.length > 3 && (
              <div className="absolute right-2 top-1/2 translate-y-[-50%] rounded-md">
                <LoadingAnimation width={"40px"} height={"40px"} />
              </div>
            )}
            <div
              className={`${
                showDes ? "" : "hidden"
              } absolute left-0 top-[100%] z-10 w-full grid grid-cols-1 gap-y-1 px-2 max-h-200px overflow-y-auto `}
            >
              <AnimatePresence mode="wait">
                {suggestionlistDes.map((location, idx) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: idx * 0.1,
                    }}
                    onMouseEnter={() => MouseHover(idx, false)}
                    onMouseLeave={() => setSuggestionHoveredDes(-1)}
                    key={location.place_id}
                    className={`transition-all ease-in-out flex items-center p-3 w-full rounded-lg text-lg cursor-pointer ${
                      location.text === selectedLocationDes
                        ? "bg-primary text-white"
                        : "bg-gray-50"
                    }
                      ${
                        suggestionHoveredDes === idx &&
                        selectedLocationDes != location
                          ? "translate-x-2 border-primary border-1"
                          : ""
                      } 
                        
  `}
                    onClick={() => handleSelectLocation(location, false)}
                  >
                    <FaMapMarkerAlt
                      className={`mr-3 ${
                        location.text === selectedLocationDes
                          ? "text-white"
                          : "text-primary"
                      }`}
                    />
                    <span>{location.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="w-full flex h-[35vh] justify-center overflow-hidden col-span-2 rounded-2xl">
          <Map
            markers={markersOrigin.concat(markersDes)}
            polylines={[{ polylines: route }]}
          />
        </div>
      </div>
    </>
  );
};

export default RoadTripContent;
