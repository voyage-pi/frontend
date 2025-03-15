import { useState } from "react"
import { Link } from "react-router-dom"
import {
  FaHeart,
  FaUsers,
  FaEarthAmericas,
  FaShareNodes,
  FaGear,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
} from "react-icons/fa6"
import VoyageCompleteLogo from "../assets/voyage-complete-logo-navy.png"
import VoyageIconLogo from "../assets/voyage-logo.png"
import RuiImage from "../assets/rui.jpg"

function SideBar({ onToggle }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleSidebar = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    if (onToggle) onToggle(newState)
  }

  const userStats = [
    { label: "Trips", count: 5 },
    { label: "Friends", count: 5 },
    { label: "Countries", count: 4 },
  ]

  const menuItems = [
    { icon: FaEarthAmericas, label: "Trips", count: 5, path: "/" },
    { icon: FaHeart, label: "Saved", count: 4, extraClass: "text-primary", path: "/saved" },
    { icon: FaUsers, label: "Friends", count: 5, path: "/friends" },
  ]

  return (
    <div
      className={`bg-base-300 min-h-screen fixed top-0 left-0 transition-all duration-300 flex flex-col justify-between ${
        isExpanded ? "w-85" : "w-20"
      }`}
    >
      {/* Top section */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          {isExpanded ? (
            <>
              <div className="m-10 flex flex-row">
                <div className="flex items-center -ml-12">
                  <img src={VoyageCompleteLogo} alt="Voyage Logo" />
                </div>
                <button onClick={toggleSidebar} className="btn btn-ghost btn-xs p-0 text-primary">
                  <FaChevronLeft size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="group relative w-full flex justify-center cursor-pointer" onClick={toggleSidebar}>
              <img
                src={VoyageIconLogo}
                alt="Voyage Logo"
                className="group-hover:opacity-0 transition-opacity duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">
                <FaChevronRight size={16} />
              </div>
            </div>
          )}
        </div>

        {/* Profile section */}
        <div className="flex flex-col items-start mt-0 mb-6 m-10">
          <div className="avatar">
            <div className={`${isExpanded ? "w-36" : "w-10 h-10"} rounded-full transition-all duration-300`}>
              <img src={RuiImage} alt="Rui Machado" />
            </div>
          </div>

          {isExpanded && (
            <div className="text-start mt-5 w-60 text-secondary">
              <div className="font-bold text-3xl">Rui Machado</div>
              <p className="text-lg opacity-70">@ruimachado</p>

              <div className="flex justify-between mt-5 text-lg">
                {userStats.map(({ label, count }, index) => (
                  <div className="text-start" key={index}>
                    <p className="font-bold">{count}</p>
                    <p>{label}</p>
                  </div>
                ))}
              </div>
              <button className="btn bg-primary hover:bg-[#f42753] border-none rounded-full mt-10 w-full flex items-center justify-start gap-3 h-12">
                <div className="bg-white rounded-full w-9 h-9 flex items-center justify-center -ml-2">
                  <span className="text-primary text-3xl font-light">+</span>
                </div>
                <span className="text-primary-content text-xl font-bold">Create</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="m-10">
          <ul className="p-0">
            {menuItems.map(({ icon: Icon, label, count, extraClass = "", path }, index) => (
              <li key={index}>
                <Link to={path} className="flex items-start gap-4 py-4 hover:opacity-80 transition-opacity">
                  <Icon className={`${extraClass} ${isExpanded ? "" : "mx-auto"}`} size={28} />
                  {isExpanded && (
                    <div className="flex justify-between w-full items-center">
                      <span className="text-2xl">{label}</span>
                      <span className="opacity-70">{count}</span>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom section */}
      <div className="mb-8 pl-10 text-2xl">
        <ul className="p-0">
          <li>
            <a className="flex items-center gap-4 py-2">
              <FaShareNodes className={`${isExpanded ? "" : "mx-auto"}`} size={28} />
              {isExpanded && <span>Share profile</span>}
            </a>
          </li>
          <li>
            <a className="flex items-center gap-4 py-2">
              <FaGear className={`${isExpanded ? "" : "mx-auto"}`} size={28} />
              {isExpanded && <span>Settings</span>}
            </a>
          </li>
        </ul>
      </div>

      {/* Mobile create button (only visible when collapsed) */}
      {!isExpanded && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <button className="btn bg-primary hover:bg-[#f42753] border-none btn-circle btn-sm">
            <FaPlus size={14} className="text-white" />
          </button>
        </div>
      )}
    </div>
  )
}

export default SideBar

