import SideBar from "./SideBar";
import { useState } from "react";
import Notification from "./Notification";
import ShareProfileModal from "./ShareProfileModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PageTemplate({ children, headerIcon, headerTitle, headerContent }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [notification, setNotification] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleSidebarToggle = (expanded) => {
    setSidebarExpanded(expanded);
  };

  const handleMenuItemClick = (item) => {
    if (item === "Share") {
      setShareModalOpen(true);
    } else if (["Friends", "Saved", "Settings"].includes(item)) {
      setNotification({
        type: "info",
        text: `${item} feature coming soon!`,
        key: Date.now(),
      });
    }
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  return (
    <div className="flex h-screen">
      <SideBar
        onToggle={handleSidebarToggle}
        onMenuItemClick={handleMenuItemClick}
      />

      <main
        className={`flex-1 transition-all duration-400 ease-in-out ${
          sidebarExpanded ? "ml-64" : "ml-16"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Page Header */}
          {(headerIcon || headerTitle || headerContent) && (
            <header className="bg-white pt-7 px-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center">
                {headerIcon && <div className="mr-3">{headerIcon}</div>}
                {headerTitle && (
                  <h1 className="text-2xl font-bold">{headerTitle}</h1>
                )}
              </div>
              {headerContent && <div>{headerContent}</div>}
            </header>
          )}

          {/* Page Content */}
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </main>

      <ToastContainer />

      {notification && (
        <Notification
          key={notification.key}
          type={notification.type}
          text={notification.text}
          onClose={handleNotificationClose}
          options={{
            position: "top-right",
            autoClose: 3000,
            pauseOnHover: false,
          }}
        />
      )}

      <ShareProfileModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}

export default PageTemplate;
