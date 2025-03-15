import SideBar from "./SideBar"
import { useState } from "react"

function PageTemplate({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const handleSidebarToggle = (expanded) => {
    setSidebarExpanded(expanded)
  }

  return (
    <div className="flex">
      <SideBar onToggle={handleSidebarToggle} />
      <main className={`p-6 transition-all duration-300 bg-base-100 ${sidebarExpanded ? "ml-[340px]" : "ml-20"}`}>{children}</main>
    </div>
  )
}

export default PageTemplate