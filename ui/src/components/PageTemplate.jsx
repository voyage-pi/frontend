import SideBar from "./SideBar"
import { useState, useEffect } from "react"
import Notification from "./Notification"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function PageTemplate({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [notification, setNotification] = useState(null)

  const handleSidebarToggle = (expanded) => {
    setSidebarExpanded(expanded)
  }

  const handleMenuItemClick = (item) => {
    if (['Friends', 'Saved', 'Settings', 'Share'].includes(item)) {
      setNotification({
        type: 'info',
        text: `${item} feature coming soon!`,
        key: Date.now() 
      })
    }
  }

  const handleNotificationClose = () => {
    setNotification(null)
  }

  return (
    <div className="">
      <SideBar onToggle={handleSidebarToggle} onMenuItemClick={handleMenuItemClick} />
      <main className={`transition-all duration-300 bg-base-100 ${sidebarExpanded ? "ml-[270px]" : "ml-17"}`}>
        {children}
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
            pauseOnHover: false
          }}
        />
      )}
    </div>
  )
}

export default PageTemplate
