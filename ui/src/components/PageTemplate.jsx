import { useState } from "react"
import Notification from "./Notification"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function PageTemplate({ children, headerIcon, headerTitle, headerContent }) {
  const [notification, setNotification] = useState(null)

  const handleNotificationClose = () => {
    setNotification(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      {(headerIcon || headerTitle || headerContent) && (
        <header className="bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center">
            {headerIcon && <div className="mr-3">{headerIcon}</div>}
            {headerTitle && <h1 className="text-2xl font-bold">{headerTitle}</h1>}
          </div>
          {headerContent && <div>{headerContent}</div>}
        </header>
      )}
      
      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      
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
