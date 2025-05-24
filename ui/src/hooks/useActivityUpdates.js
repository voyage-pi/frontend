import { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../utils/axiosInstance";
import { supabase } from "../utils/supabaseClient";

export function useActivityUpdates({ tripId, onItineraryUpdate }) {
  const [refreshingActivity, setRefreshingActivity] = useState(null);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);

  // Setup real-time updates channel
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`trip-${tripId}`)
      .on("broadcast", { event: "trip-update" }, ({ payload }) => {
        if (
          payload.tripId === tripId &&
          payload.timestamp !== lastUpdateTimestamp
        ) {
          onItineraryUpdate({
            type: "info",
            text: "Trip has been updated by another user. Refreshing...",
            key: Date.now(),
          });

          // Refetch the trip data
          axiosInstance
            .get(`/trips/${tripId}`)
            .then((response) => {
              if (response.data && response.data.response) {
                onItineraryUpdate(response.data.response);
              }
            })
            .catch((error) => console.error("Error refreshing trip:", error));
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [tripId, lastUpdateTimestamp]);

  const handleRefreshActivity = async (activityId) => {
    setRefreshingActivity(activityId);
    try {
      const response = await axiosInstance.post(
        `/trip/${tripId}/regenerate-activity`,
        {
          activityId: activityId,
        }
      );

      if (response.data.itinerary) {
        // Set the timestamp of this update
        const updateTimestamp = new Date().toISOString();
        setLastUpdateTimestamp(updateTimestamp);

        // Broadcast the update to other users
        await supabase.channel(`trip-${tripId}`).send({
          type: "broadcast",
          event: "trip-update",
          payload: {
            tripId: tripId,
            timestamp: updateTimestamp,
          },
        });

        onItineraryUpdate(response.data);
      }
    } catch (error) {
      console.error("Error refreshing activity:", error);
      onItineraryUpdate({
        type: "error",
        text: "Failed to refresh activity",
        key: Date.now(),
      });
    } finally {
      setRefreshingActivity(null);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const response = await axiosInstance.delete(
        `/trip/${tripId}/activity/${activityId}`
      );

      if (response.data) {
        // Set the timestamp of this update
        const updateTimestamp = new Date().toISOString();
        setLastUpdateTimestamp(updateTimestamp);

        // Broadcast the update to other users
        await supabase.channel(`trip-${tripId}`).send({
          type: "broadcast",
          event: "trip-update",
          payload: {
            tripId: tripId,
            timestamp: updateTimestamp,
          },
        });

        // First update the UI with success message
        onItineraryUpdate({
          type: "success",
          text: "Activity deleted successfully",
          key: Date.now(),
        });

        // Then fetch fresh trip data to ensure UI is in sync
        const tripResponse = await axiosInstance.get(`/trips/${tripId}`);
        if (tripResponse.data && tripResponse.data.response) {
          onItineraryUpdate(tripResponse.data.response);
        }
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      onItineraryUpdate({
        type: "error",
        text: "Failed to delete activity",
        key: Date.now(),
      });
    }
  };

  return {
    refreshingActivity,
    handleRefreshActivity,
    handleDeleteActivity,
  };
}
