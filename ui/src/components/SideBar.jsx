import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
    FaHeart,
    FaUsers,
    FaEarthAmericas,
    FaShareNodes,
    FaGear,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa6"
import VoyageCompleteLogo from "../assets/voyage-complete-logo-navy.png"
import VoyageIconLogo from "../assets/voyage-logo.png"
import userData from "../../public/user.json"

function SideBar({ onToggle }) {
    const [isExpanded, setIsExpanded] = useState(true)

    const toggleSidebar = () => {
        const newState = !isExpanded
        setIsExpanded(newState)
        if (onToggle) onToggle(newState)
    }

    const userStats = [
        { label: "Trips", count: userData.stats.trips },
        { label: "Friends", count: userData.stats.friends },
        { label: "Countries", count: userData.stats.countries },
    ]

    const menuItems = [
        { icon: FaEarthAmericas, label: "Trips", count: userData.stats.trips, path: "/" },
        { icon: FaHeart, label: "Saved", count: userData.stats.saved, path: "/saved" },
        { icon: FaUsers, label: "Friends", count: userData.stats.friends, path: "/friends" },
    ]

    return (
        <div className={`bg-base-300 min-h-screen fixed top-0 left-0 overflow-y-auto transition-[width,margin,padding] duration-500 ease-in-out flex flex-col justify-between ${isExpanded ? "w-85" : "w-20"}`}>
            {/* Top section */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between">
                    {isExpanded ? (
                        <div
                            className="m-10 mt-2 flex flex-row transition-[margin] duration-500 ease-in-out"
                        >
                            <div
                                className="-ml-12 flex items-center
                                           transition-[margin] duration-500 ease-in-out"
                            >
                                <img src={VoyageCompleteLogo} alt="Voyage Logo" />
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="p-0 text-primary hover:scale-105 transition-transform duration-100 ease-in-out"
                            >
                                <FaChevronLeft size={18} />
                            </button>
                        </div>
                    ) : (
                        <div
                            className="group relative w-full flex justify-center cursor-pointer pt-3"
                            onClick={toggleSidebar}
                        >
                            <img
                                src={VoyageIconLogo}
                                alt="Voyage Logo"
                                className="group-hover:opacity-0 transition-opacity duration-300"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">
                                <FaChevronRight size={18} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile section */}
                <div
                    className={`flex flex-col ${isExpanded ? "px-10 items-start" : "px-0 items-center"} mt-6 transition-[padding] duration-500 ease-in-out`}
                >
                    <div className="avatar">
                        <div
                            className={`rounded-full border-3 border-white transition-[width,height] duration-500 ease-in-out ${isExpanded ? "w-36" : "w-11 mt-30"}`}>
                            <img src={userData.image} alt={userData.name} />
                        </div>
                    </div>

                    {isExpanded ? (
                        <div className="text-start mt-5 w-full text-secondary transition-opacity duration-300 opacity-100">
                            <div className="font-bold text-3xl">{userData.name}</div>
                            <p className="text-lg opacity-70">{userData.tag}</p>

                            <div className="flex justify-between mt-5 text-lg">
                                {userStats.map(({ label, count }, index) => (
                                    <div className="text-start" key={index}>
                                        <p className="font-bold">{count}</p>
                                        <p>{label}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="btn bg-primary hover:bg-[#f42753] border-none rounded-full mt-10 w-full flex items-center justify-start gap-4 h-12">
                                <div className="bg-white rounded-full w-9 h-9 flex items-center justify-center -ml-2">
                                    <span className="text-primary text-3xl font-light">+</span>
                                </div>
                                <span className="text-primary-content text-xl font-bold">Create</span>
                            </button>
                        </div>
                    ) : (
                        <button className="btn bg-primary hover:bg-[#f42753] border-none rounded-full mt-65 w-9 h-9 flex items-center justify-center p-0">
                            <span className="text-primary-content text-3xl font-light">+</span>
                        </button>
                    )}

                    {/* Navigation */}
                    <nav className="w-full mt-10">
                        <ul className="w-full">
                            {menuItems.map(({ icon: Icon, label, count, path }, index) => (
                                <li key={index} className="w-full">
                                    <NavLink
                                        to={path}
                                        className={({ isActive }) =>`flex w-full items-center gap-4 py-2 rounded-full transition-transform mb-5 h-12 px-4 ${isActive && isExpanded ? "bg-primary/10 text-primary font-bold" : "px-0 hover:opacity-80 items-center justify-center"}`}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isExpanded ? "-ml-2" : "items-center mt-4"} transition-[margin] duration-500 ease-in-out`}>
                                                    <Icon className={isActive ? "text-primary" : "text-secondary"} size={28}/>
                                                </div>
                                                {isExpanded && (
                                                    <div className="flex w-full justify-between items-center transition-opacity duration-300 opacity-100">
                                                        <span className="text-xl">{label}</span>
                                                        <span className="opacity-70">{count}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Bottom section */}
            <div className={`mb-8 text-xl text-secondary ${isExpanded ? "mx-12" : "mx-auto"} transition-[margin] duration-500 ease-in-out`}>
                <ul className="p-0">
                    <li>
                        <a className="flex items-center gap-4 py-2 cursor-pointer hover:opacity-95">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isExpanded ? "-ml-2" : ""} transition-[margin] duration-500 ease-in-out`}>
                                <FaShareNodes size={28} />
                            </div>
                            {isExpanded && <span>Share</span>}
                        </a>
                    </li>
                    <li>
                        <a className="flex items-center gap-4 py-2 cursor-pointer hover:opacity-95">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isExpanded ? "-ml-2" : ""} transition-[margin] duration-500 ease-in-out`}>
                                <FaGear size={28}/>
                            </div>
                            {isExpanded && <span>Settings</span>}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default SideBar
