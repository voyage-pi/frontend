import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlaceCard from "./PlaceCard";

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
    "relative flex flex-col gap-4 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100";

  if (tripType === "road") {
    return (
      <div className={scrollContainerClasses}>
        <div className="pb-12">
          {(stops || []).map((stop, index) => (
            <PlaceCard
              key={`${stop.id || index}-${index}`}
              id={stop.id || index}
              place={stop.place?.name || "Unknown Place"}
              time={null}
              transport={null}
              image={activityImages[stop.id] || stop.image || ""}
              onRefresh={() => onRefreshActivity(stop.id)}
              onDelete={() => onDeleteActivity(stop.id)}
              road={true}
              onClick={() => onPlaceClick(stop.place)}
              participants={participants}
            />
          ))}
        </div>
        {/* Fade-out effect at the bottom */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
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
    <div className={scrollContainerClasses}>
      <div className="pb-12">
        {allActivities.map((activity, index) => (
          <PlaceCard
            key={`${activity.id}-${index}`}
            id={activity.id}
            place={activity.place?.name || "Unknown Place"}
            time={`${formatTime(activity.start_time)} - ${formatTime(
              activity.end_time
            )}`}
            transport={activity.transport || {}}
            image={activityImages[activity.id] || ""}
            onRefresh={() => onRefreshActivity(activity.id)}
            onDelete={() => onDeleteActivity(activity.id)}
            refreshing={refreshingActivity === activity.id}
            onClick={() => onPlaceClick(activity.place)}
            participants={participants}
          />
        ))}
      </div>
      {/* Fade-out effect at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default ActivityList;
