import { useCallback, useRef } from "react";
import { toast } from "react-toastify";

export const useNotifications = () => {
  const lastNotificationRef = useRef({ type: null, text: null, timestamp: 0 });

  const showNotification = useCallback((type, text) => {
     ;

    // Prevent duplicate notifications within 3 seconds
    const now = Date.now();
    if (
      lastNotificationRef.current.type === type &&
      lastNotificationRef.current.text === text &&
      now - lastNotificationRef.current.timestamp < 3000
    ) {
      console.log(
        "[Notification Blocked] Duplicate notification within 3 seconds"
      );
      return;
    }

    // Update last notification info
    lastNotificationRef.current = { type, text, timestamp: now };
     ;

    // Map our notification types to toast types
    const toastType =
      type === "error"
        ? "error"
        : type === "success"
        ? "success"
        : type === "warning"
        ? "warning"
        : "info";

    toast(text, {
      type: toastType,
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
    });
  }, []);

  return {
    showNotification,
  };
};
