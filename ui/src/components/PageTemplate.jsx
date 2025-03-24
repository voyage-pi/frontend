import SideBar from "./SideBar"
import { useState } from "react"

function PageTemplate({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const handleSidebarToggle = (expanded) => {
    setSidebarExpanded(expanded)
  }

  return (
    <div className="">
      <SideBar onToggle={handleSidebarToggle} />
      <main className={`p-8 transition-all duration-300 bg-base-100 ${sidebarExpanded ? "ml-[270px]" : "ml-17"}`}>{children}</main>
    </div>
  )
}

export default PageTemplate