import { useState } from "react";
import { ToastContainer } from "react-toastify";
import Notification from "../components/Notification";

export const useNotifications = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, text) => {
    setNotification({
      type,
      text,
      key: Date.now(),
    });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const NotificationContainer = () => (
    <>
      <ToastContainer />
      {notification && (
        <Notification
          key={notification.key}
          type={notification.type}
          text={notification.text}
          onClose={clearNotification}
          options={{
            position: "top-right",
            autoClose: 3000,
            pauseOnHover: false,
          }}
        />
      )}
    </>
  );

  return {
    notification,
    showNotification,
    clearNotification,
    NotificationContainer,
  };
};
