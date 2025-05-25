import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaTrash } from "react-icons/fa";
import { FaSistrix } from "react-icons/fa6";
import { axiosPlace } from "../../../utils/axiosInstance";
import LoadingAnimation from "../../LoadingAnimation";
import { motion } from "motion/react";
import { AnimatePresence } from "framer-motion";

const MustVisitPlacesContent = () => {
  const [suggestionlist, setSuggestionList] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestionHovered, setSuggestionHovered] = useState(-1);
  const [mustVisitPlaces, setMustVisitPlaces] = useState([]);
  // Cache for photo URLs
  const [placesLoading, setPlacesLoading] = useState(false);
  const [photoCache, setPhotoCache] = useState({});
  const timeoutRef = useRef(null);

  useEffect(() => {
    const savedPlaces =
      JSON.parse(localStorage.getItem("MustVisitPlaces")) || [];
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
    if (mustVisitPlaces.some((place) => place.name === placeName)) {
      return;
    }

    try {
      const response = await axiosPlace.post("/search/", {
        place_name: placeName,
      });

      const id = response.data.place_id;
      const place_response = await axiosPlace.get("/places/" + id);
      const current_place = place_response.data;

      const imageURL = await getPhotoUrl(current_place);

      const newPlace = {
        place: current_place,
        image: imageURL,
      };

      setMustVisitPlaces((prev) => [...prev, newPlace]);
      console.log("Place added:", mustVisitPlaces);

      setCurrentText("");
      setSuggestionList([]);
    } catch (error) {
      console.error("Add place error:", error);
    } finally {
      setPlacesLoading(false);
    }
  };

  const generatePlaceholderImage = (seed) => {
    const seedStr = typeof seed === "string" ? seed : "place";
    const cleanSeed = seedStr.replace(/[^a-zA-Z0-9]/g, "");
    return `https://picsum.photos/seed/${encodeURIComponent(
      cleanSeed
    )}/400/300`;
  };

  const getPhotoUrl = async (place) => {
    if (!place || !place.photos || !place.photos.length) {
      console.log("No photos available for", place?.name);
      return generatePlaceholderImage(place ? place.name : "place");
    }

    const placeId = place.id || place.name;
    if (photoCache[placeId]) {
      return photoCache[placeId];
    }

    const photo = place.photos[0];
    try {
      const response = await axiosPlace.post("/places/photo", {
        gRPC: photo.name,
      });
      console.log(response);
      if (response.status == 429) {
        return getPhotoUrl(place);
      }
      const photoUrl = response.data?.uri;
      setPhotoCache((prev) => ({
        [placeId]: photoUrl,
      }));

      return photoUrl;
    } catch (error) {
      console.error("Error fetching photo:", error);
      return generatePlaceholderImage(place.name);
    }
  };

  const removePlace = (placeIndexed) => {
    setMustVisitPlaces((prev) =>
      prev.filter((place) => place !== placeIndexed)
    );
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
    if (suggestionlist.length === 0) return;

    let key = event.key;
    let suggestionsL = suggestionlist.length || 1;

    if (key === "ArrowDown") {
      setSuggestionHovered((prev) => (prev + 1) % suggestionsL);
    } else if (key === "ArrowUp") {
      setSuggestionHovered(
        (prev) => ((prev <= 0 ? suggestionsL : prev) - 1) % suggestionsL
      );
    } else if (key === "Enter") {
      if (suggestionHovered >= 0 && suggestionHovered < suggestionlist.length) {
        setPlacesLoading(true);
        addPlace(suggestionlist[suggestionHovered].text);
      }
    }
  };

  const handleMouseHover = (idx) => {
    setSuggestionHovered(idx);
  };

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
                      suggestionHovered === idx
                        ? "translate-x-2 border-primary border-1"
                        : ""
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
          <div className=" h-84 w-full overflow-y-auto">
            <div className={`grid grid-cols-2 gap-2 overflow-y-auto w-full `}>
              <AnimatePresence mode="wait">
                {mustVisitPlaces.length !== 0 &&
                  mustVisitPlaces.map((place, index) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        translateY: 20,
                      }}
                      animate={{
                        opacity: 1,
                        translateY: 0,
                      }}
                      exit={{
                        opacity: 0,
                        translateY: -20,
                      }}
                      className="h-[150px] w-full rounded-2xl relative  overflow-hidden "
                    >
                      {place.image ? (
                        <img
                          className="w-full brightness-30"
                          src={place.image}
                          alt="image"
                        />
                      ) : (
                        <div className="absolute top-0 left-0 w-full h-full bg-secondary"></div>
                      )}
                      <div className="absolute top-[50%] translate-x-[-50%] left-[50%] text-white text-center translate-y-[-50%] w-full text-2xl">
                        {place.place?.name}
                      </div>
                      <button
                        onClick={() => removePlace(place)}
                        className="absolute top-0 right-0  bg-white p-2 cursor-pointer  rounded-full shadow-md hover:bg-red-100 transition-colors"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </motion.div>
                  ))}
                {mustVisitPlaces.length === 0 ? (
                  <div className="flex items-center justify-center h-full w-full">
                    <div className="text-center text-gray-500">
                      No must-visit places added yet.
                    </div>
                  </div>
                ) : (
                  placesLoading && <div className="skeleton h-32 w-full"></div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MustVisitPlacesContent;
