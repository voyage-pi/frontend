import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../utils/supabaseClient";

export function useCursorTracking({ tripId, isAuthenticated, LoggedUser }) {
  const [otherCursors, setOtherCursors] = useState({});
  const [cursorId, setCursorId] = useState(null);
  const [cursorClicks, setCursorClicks] = useState({});
  const [hasActiveCollaborators, setHasActiveCollaborators] = useState(false);
  const cursorChannelRef = useRef(null);

  // Initialize cursor ID and cleanup on unmount
  useEffect(() => {
    const newCursorId = uuidv4();
    setCursorId(newCursorId);

    return () => {
      if (cursorId && tripId) {
        supabase
          .from("cursors")
          .delete()
          .match({ id: cursorId, trip_id: tripId })
          .then(() => {
            console.log("Cursor data cleaned up");
          });
      }
    };
  }, []);

  // Setup cursor channel
  useEffect(() => {
    if (!tripId || !cursorId) return;

    console.log(
      `Setting up cursor channel for trip ${tripId} with cursor ID ${cursorId}`
    );

    const cursorChannel = supabase.channel(`cursors-${tripId}`);

    cursorChannel
      .on("broadcast", { event: "cursor-move" }, handleCursorUpdate)
      .on("broadcast", { event: "user-joined" }, handleUserJoined)
      .on("broadcast", { event: "user-left" }, handleUserLeft)
      .subscribe((status) => {
        console.log(`Cursor channel status: ${status}`);

        if (status === "SUBSCRIBED" && isAuthenticated) {
          cursorChannel.send({
            type: "broadcast",
            event: "user-joined",
            payload: {
              userId: LoggedUser?.id || "anonymous",
              cursorId: cursorId,
            },
          });
        }
      });

    cursorChannelRef.current = cursorChannel;
    window._cursorChannel = cursorChannel;

    return () => {
      if (cursorChannel && isAuthenticated) {
        cursorChannel.send({
          type: "broadcast",
          event: "user-left",
          payload: {
            userId: LoggedUser?.id || "anonymous",
            cursorId: cursorId,
          },
        });
      }

      console.log("Unsubscribing from cursor channel");
      cursorChannel.unsubscribe();
      window._cursorChannel = null;
    };
  }, [tripId, cursorId, isAuthenticated]);

  // Clean up old clicks
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursorClicks((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          if (now - updated[id].timestamp > 800) {
            delete updated[id];
          }
        });
        return updated;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Remove stale cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setOtherCursors((prevCursors) => {
        const updated = { ...prevCursors };
        Object.keys(updated).forEach((id) => {
          if (now - updated[id].lastUpdate > 10000) {
            delete updated[id];
          }
        });
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleUserJoined = (payload) => {
    if (payload && payload.payload && payload.payload.cursorId !== cursorId) {
      setHasActiveCollaborators(true);

      if (cursorChannelRef.current && isAuthenticated) {
        cursorChannelRef.current.send({
          type: "broadcast",
          event: "user-joined",
          payload: {
            userId: LoggedUser?.id || "anonymous",
            cursorId: cursorId,
          },
        });
      }
    }
  };

  const handleUserLeft = (payload) => {
    if (payload && payload.payload && payload.payload.cursorId !== cursorId) {
      setOtherCursors((prev) => {
        const updated = { ...prev };
        delete updated[payload.payload.cursorId];

        const remainingUsers = Object.keys(updated).length;
        if (remainingUsers === 0) {
          setHasActiveCollaborators(false);
        }

        return updated;
      });
    }
  };

  const handleCursorUpdate = (payload) => {
    if (
      payload &&
      payload.payload &&
      payload.payload.cursor &&
      payload.payload.cursor.id !== cursorId
    ) {
      const cursor = payload.payload.cursor;
      setHasActiveCollaborators(true);

      if (cursor.isClicking) {
        setCursorClicks((prev) => ({
          ...prev,
          [cursor.id]: {
            x: cursor.x,
            y: cursor.y,
            timestamp: Date.now(),
          },
        }));
      }

      setOtherCursors((prev) => ({
        ...prev,
        [cursor.id]: {
          ...cursor,
          lastUpdate: new Date().getTime(),
        },
      }));
    }
  };

  const updateCursorPosition = (e, containerRef) => {
    if (
      !tripId ||
      !cursorId ||
      !containerRef.current ||
      !isAuthenticated ||
      !cursorChannelRef.current ||
      !hasActiveCollaborators
    )
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const cursorData = {
      id: cursorId,
      trip_id: tripId,
      user_id: LoggedUser?.id || "anonymous",
      user_name:
        LoggedUser?.email?.split("@")[0] ||
        LoggedUser?.user_metadata?.full_name ||
        LoggedUser?.email ||
        "Guest",
      x: x,
      y: y,
      timestamp: new Date().toISOString(),
      isClicking: false,
    };

    const now = Date.now();
    if (now - (window._lastCursorUpdate || 0) < 50) return;
    window._lastCursorUpdate = now;

    cursorChannelRef.current
      .send({
        type: "broadcast",
        event: "cursor-move",
        payload: { cursor: cursorData },
      })
      .catch((error) => {
        console.error("Error sending cursor position:", error);
      });
  };

  const handleCursorClick = (e, containerRef) => {
    if (
      !tripId ||
      !cursorId ||
      !containerRef.current ||
      !isAuthenticated ||
      !cursorChannelRef.current ||
      !hasActiveCollaborators
    )
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const cursorData = {
      id: cursorId,
      trip_id: tripId,
      user_id: LoggedUser?.id || "anonymous",
      user_name:
        LoggedUser?.email?.split("@")[0] ||
        LoggedUser?.user_metadata?.full_name ||
        LoggedUser?.email ||
        "Guest",
      x: x,
      y: y,
      timestamp: new Date().toISOString(),
      isClicking: true,
    };

    cursorChannelRef.current
      .send({
        type: "broadcast",
        event: "cursor-move",
        payload: { cursor: cursorData },
      })
      .catch((error) => {
        console.error("Error sending cursor click:", error);
      });
  };

  return {
    otherCursors,
    cursorClicks,
    cursorId,
    hasActiveCollaborators,
    updateCursorPosition,
    handleCursorClick,
  };
}
