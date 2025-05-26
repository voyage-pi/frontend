import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlaceCard from "./PlaceCard";
import "../styles/scrollbar.css";

function ActivityList({
  days,
  selectedDay,
  loading,
  refreshingActivity,
  photoCache,
  getPhotoUrl,
  onRefreshActivity,
  onDeleteActivity,
  tripType,
  stops,
  onPlaceClick,
  participants,
}) {
  // State to track image loading for activities
  const [activityImages, setActivityImages] = useState({});
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollContainerRef = useRef(null);

  // Effect to load images for current day's activities
  useEffect(() => {
    if (loading) return;

    const loadImages = async () => {
      // If refreshingActivity is "all-activities", clear the existing cache
      if (refreshingActivity === "all-activities") {
        setActivityImages({});
      }

      const newImages = { ...activityImages };

      if (tripType === "road") {
        for (const stop of stops || []) {
          if (
            (!activityImages[stop.id] ||
              stop.id === refreshingActivity ||
              refreshingActivity === "all-activities") &&
            stop.place
          ) {
            const imageUrl = await getPhotoUrl(stop.place);
            newImages[stop.id] = imageUrl;
          }
        }
      } else if (days && days[selectedDay]) {
        const selectedDayData = days[selectedDay];
        const allActivities = [
          ...(selectedDayData.morning_activities || []),
          ...(selectedDayData.afternoon_activities || []),
        ];

        for (const activity of allActivities) {
          if (
            (!activityImages[activity.id] ||
              activity.id === refreshingActivity ||
              refreshingActivity === "all-activities") &&
            activity.place
          ) {
            const imageUrl = await getPhotoUrl(activity.place);
            newImages[activity.id] = imageUrl;
          }
        }
      }

      if (Object.keys(newImages).length > 0) {
        setActivityImages(newImages);
      }
    };

    loadImages();
  }, [
    days,
    selectedDay,
    stops,
    tripType,
    loading,
    refreshingActivity,
    getPhotoUrl,
  ]);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    setCanScrollUp(scrollTop > 5);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 5);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => checkScrollability();

    checkScrollability();
    container.addEventListener("scroll", handleScroll);

    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [days, selectedDay, stops, tripType]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const scrollContainerClasses =
    "flex flex-col gap-4 overflow-y-auto custom-scrollbar";

  if (tripType === "road") {
    return (
      <div
        className={`relative h-full scroll-container ${
          canScrollUp ? "has-scroll-up" : ""
        } ${canScrollDown ? "has-scroll-down" : ""}`}
      >
        <div
          ref={scrollContainerRef}
          className={`${scrollContainerClasses} h-full`}
        >
          <div className="pb-12 pt-2">
            {(stops || []).map((stop, index) => (
              <PlaceCard
                key={`${stop.id || index}-${index}`}
                id={stop.id || index}
                displayOrder={index + 1}
                place={stop.place?.name || "Unknown Place"}
                time={null}
                transport={null}
                image={activityImages[stop.id] || stop.image || ""}
                onRefresh={() => onRefreshActivity(stop.id)}
                onDelete={() => onDeleteActivity(stop.id)}
                onClick={() => onPlaceClick(stop.place, index + 1)}
                road={true}
                participants={participants}
              />
            ))}
          </div>
        </div>

        {canScrollDown && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none z-10" />
        )}
      </div>
    );
  }

  if (!days || !days[selectedDay]) {
    return <div>No activities for this day</div>;
  }

  const selectedDayData = days[selectedDay];
  const allActivities = [
    ...(selectedDayData.morning_activities || []),
    ...(selectedDayData.afternoon_activities || []),
  ].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  return (
    <div
      className={`relative h-full scroll-container ${
        canScrollUp ? "has-scroll-up" : ""
      } ${canScrollDown ? "has-scroll-down" : ""}`}
    >
      <div
        ref={scrollContainerRef}
        className={`${scrollContainerClasses} h-full`}
      >
        <div className="pb-12 pt-2">
          {allActivities.map((activity, index) => (
            <PlaceCard
              key={`${activity.id}-${index}`}
              id={activity.id}
              displayOrder={index + 1}
              place={activity.place?.name || "Unknown Place"}
              time={`${formatTime(activity.start_time)} - ${formatTime(
                activity.end_time
              )}`}
              transport={activity.transport || {}}
              image={activityImages[activity.id] || ""}
              onRefresh={() => onRefreshActivity(activity.id)}
              onDelete={() => onDeleteActivity(activity.id)}
              refreshing={refreshingActivity === activity.id}
              onClick={() => onPlaceClick(activity.place, index + 1)}
              participants={participants}
            />
          ))}
        </div>
      </div>

      {canScrollDown && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none z-10" />
      )}
    </div>
  );
}

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default ActivityList;
