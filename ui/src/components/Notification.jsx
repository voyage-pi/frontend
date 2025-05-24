import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notification = ({ type, text, message, onClose, options = {} }) => {
  const displayText = message || text; // Use message if provided, otherwise fall back to text

  const defaultOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    onClose: onClose,
    ...options,
  };

  const showNotification = () => {
    switch (type) {
      case "success":
        toast.success(displayText, defaultOptions);
        break;
      case "error":
        toast.error(displayText, defaultOptions);
        break;
      case "info":
        toast.info(displayText, defaultOptions);
        break;
      case "warning":
        toast.warning(displayText, defaultOptions);
        break;
      default:
        toast(displayText, defaultOptions);
    }
  };

  useEffect(() => {
    showNotification();
  }, []);

  return <ToastContainer />;
};

export default Notification;
