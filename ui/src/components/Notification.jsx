import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notification = ({ type, text, onClose, options = {} }) => {
  const defaultOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    onClose: onClose, 
    ...options
  };

  const showNotification = () => {
    switch (type) {
      case 'success':
        toast.success(text, defaultOptions);
        break;
      case 'error':
        toast.error(text, defaultOptions);
        break;
      case 'info':
        toast.info(text, defaultOptions);
        break;
      case 'warning':
        toast.warning(text, defaultOptions);
        break;
      default:
        toast(text, defaultOptions);
    }
  };

  useEffect(() => {
    showNotification();
  }, []);

  return <ToastContainer />;
};

export default Notification;