import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VoyageLogo from "../assets/voyage-complete-logo-navy.png";
import { GoPeople, GoClock } from "react-icons/go";
import { IoLocationOutline } from "react-icons/io5";
import { GiPathDistance } from "react-icons/gi";
import { FaRegFloppyDisk, FaMapLocationDot } from "react-icons/fa6";
import PreferencesButton from "./PreferencesButton";
import { useAuth } from "../context/AuthContext";
import { TbCoinEuro } from "react-icons/tb";


function ItineraryHeader({
  title,
  totalDays,
  totalPeople,
  locationName,
  distancePill,
  priceRange,
  tripType,
  onSaveTrip,
  onOpenInGoogleMaps,
  onPreferencesClick,
  tripId,
  itinerary,
  exportDropdownOpen,
  setExportDropdownOpen,
  generateGoogleMapsUrl,
  participants,
}) {
  const navigate = useNavigate();
  const exportDropdownRef = useRef(null);
  const { LoggedUser } = useAuth();

  const isParticipant =
    (!LoggedUser && (!participants || participants.length === 0)) || // Allow editing for guest-created trips only when not logged in
    (LoggedUser &&
      participants &&
      participants.some((p) => p.user_id === LoggedUser.id)); // Or if logged in user is a participant

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target)
      ) {
        setExportDropdownOpen(false);
      }
    }
    if (exportDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportDropdownOpen, setExportDropdownOpen]);

  return (
    <div className="">
      <div className="flex flex-row mb-4 items-center gap-5">
        <h1 className="text-3xl font-bold">{title}</h1>
        {isParticipant && (
          <div
            className="btn btn-md btn-white rounded-full btn-circle shadow-sm"
            onClick={onSaveTrip}
          >
            <FaRegFloppyDisk className="text-primary text-xl" />
          </div>
        )}
        <div className="relative z-[100]" ref={exportDropdownRef}>
          <button
            className="btn btn-md btn-white rounded-full btn-circle shadow-sm flex items-center justify-center relative z-[100]"
            onClick={() =>
              tripType === "road"
                ? onOpenInGoogleMaps()
                : setExportDropdownOpen((open) => !open)
            }
            aria-haspopup="true"
            aria-expanded={exportDropdownOpen}
          >
            <FaMapLocationDot className="text-primary text-xl" />
          </button>
          {exportDropdownOpen && (
            <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-[100]">
              {tripType !== "road" &&
              itinerary.days &&
              itinerary.days.length > 0 ? (
                itinerary.days.map((_, idx) => (
                  <button
                    key={idx}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-700"
                    onClick={() => {
                      onOpenInGoogleMaps(idx);
                      setExportDropdownOpen(false);
                    }}
                  >
                    Export Day {idx + 1}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-400">No days to export</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between pb-5">
        <div className="flex flex-wrap gap-x-5">
          {tripType !== "road" && (
            <div className="rounded-full w-fit border-1 m-1 border-secondary/10">
              <div className="flex flex-row items-center gap-x-3 m-1">
                <GoClock className="text-primary ml-1" />
                <div className="mr-2">
                  <span className="font-bold"> {totalDays} </span>
                  {totalDays === 1 ? "day" : "days"}
                </div>
              </div>
            </div>
          )}
          {tripType !== "road" && (~~priceRange?.start_price!==0 && ~~priceRange?.end_price!==0) && (
            <div className="rounded-full w-fit border-1 m-1 border-secondary/10">
              <div className="flex flex-row items-center gap-x-3 m-1">
                <TbCoinEuro PclassName="text-primary ml-1" />
                <div className="mr-2">
                   {~~priceRange?.start_price}-{~~priceRange?.end_price}
                </div>
              </div>
            </div>
          )}
          {tripType !== "road" && (
            <div className="rounded-full w-fit border-1 m-1 border-secondary/10">
              <div className="flex flex-row items-center gap-x-3 m-1">
                <GoPeople className="text-primary ml-1" />
                <div className="mr-2">
                  <span className="font-bold"> {totalPeople} </span>
                  {totalPeople === 1 ? "person" : "people"}
                </div>
              </div>
            </div>
          )}
          {tripType !== "road" && (
            <div className="rounded-full w-fit border-1 m-1 border-secondary/10">
              <div className="flex flex-row items-center gap-x-3 m-1">
                <IoLocationOutline className="text-primary ml-1" />
                <div className="mr-2">
                  <span> {locationName} </span>
                </div>
              </div>
            </div>
          )}
          {tripType === "road" && (
            <div className="rounded-full w-fit border-1 m-1 border-secondary/10">
              <div className="flex flex-row items-center gap-x-3 m-1">
                <GiPathDistance className="text-primary ml-1" />
                <div className="mr-2">
                  <span> {parseInt(distancePill / 1000) + " km"} </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preferences Button - only show for participants */}
        {isParticipant && (
          <div className="m-1" >
            <PreferencesButton onClick={onPreferencesClick} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ItineraryHeader;