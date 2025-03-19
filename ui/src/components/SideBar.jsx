import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
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
    const location = useLocation();
    const isFormsPath = location.pathname === "/forms";
    
    const [isExpanded, setIsExpanded] = useState(() => {
        const storedState = JSON.parse(localStorage.getItem("sidebarState"));
        if (isFormsPath) {
            return false;
        }
        return storedState !== null ? storedState : true;
    });
    
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (isFormsPath && isExpanded) {
            setIsExpanded(false);
            localStorage.setItem("sidebarState", JSON.stringify(false));
            onToggle(false);
        }
    }, [location.pathname, isFormsPath]);

    useEffect(() => {
        onToggle(isExpanded);
    }, []);

    const toggleSidebar = () => {
        setIsTransitioning(true);
        setIsExpanded((prev) => {
            const newState = !prev;
            localStorage.setItem("sidebarState", JSON.stringify(newState));
            onToggle(newState);
            return newState;
        });
        
        setTimeout(() => {
            setIsTransitioning(false);
        }, 500);
    };

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
        <div className={`bg-base-300 min-h-screen fixed top-0 left-0 overflow-hidden transition-all duration-400 ease-in-out flex flex-col justify-between ${isExpanded ? "w-64" : "w-16"}`}>
            {/* Top section */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between">
                    {isExpanded ? (
                        <div
                            className="m-8 mt-2 flex flex-row transition-all duration-400 ease-in-out"
                        >
                            <div
                                className="-ml-10 flex items-center transition-all duration-400 ease-in-out"
                            >
                                <img 
                                    src={VoyageCompleteLogo} 
                                    alt="Voyage Logo" 
                                    className="max-w-48 transition-all duration-400 ease-in-out" 
                                />
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="pl-7 text-primary hover:scale-105 transition-transform duration-200 ease-in-out"
                                disabled={isTransitioning}
                            >
                                <FaChevronLeft size={16} />
                            </button>
                        </div>
                    ) : (
                        <div
                            className="group relative w-full flex justify-center cursor-pointer pt-4 transition-all duration-400 ease-in-out"
                            onClick={toggleSidebar}
                        >
                            <img
                                src={VoyageIconLogo}
                                alt="Voyage Logo"
                                className="group-hover:opacity-0 transition-opacity duration-300 max-w-14"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary pt-3">
                                <FaChevronRight size={17} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile section */}
                <div
                    className={`flex flex-col ${isExpanded ? "px-8 items-start" : "px-0 items-center"} mt-5 transition-all duration-400 ease-in-out`}
                >
                    <div className="avatar">
                        <div
                            className={`rounded-full border-2 border-white transition-all duration-400 ease-in-out ${isExpanded ? "w-28" : "w-9 mt-20"}`}>
                            <img src={userData.image} alt={userData.name} />
                        </div>
                    </div>

                    <div className={`text-start mt-4 w-full text-secondary transition-all duration-400 ease-in-out ${isExpanded ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}>
                        <div className="font-bold text-2xl">{userData.name}</div>
                        <p className="text-base opacity-70">{userData.tag}</p>

                        <div className="flex justify-between mt-4 text-base">
                            {userStats.map(({ label, count }, index) => (
                                <div className="text-start" key={index}>
                                    <p className="font-bold">{count}</p>
                                    <p className="text-sm">{label}</p>
                                </div>
                            ))}
                        </div>
                        <NavLink to="/forms">
                            <button className="btn bg-primary hover:bg-[#f42753] border-none rounded-full mt-10 w-full flex items-center justify-start gap-3 h-10 shadow-sm transition-all duration-400 ease-in-out">
                                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center -ml-2">
                                    <span className="text-primary text-2xl font-light">+</span>
                                </div>
                                <span className="text-primary-content text-lg font-bold">Create</span>
                            </button>
                        </NavLink>
                    </div>

                    {!isExpanded && (
                        <button className="btn bg-primary hover:bg-[#f42753] border-none rounded-full mt-51 w-7 h-7 flex items-center justify-center p-0 transition-all duration-400 ease-in-out">
                            <span className="text-primary-content text-2xl font-light">+</span>
                        </button>
                    )}

                    {/* Navigation */}
                    <nav className="w-full mt-10 transition-all duration-400 ease-in-out">
                        <ul className="w-full">
                            {menuItems.map(({ icon: Icon, label, count, path }, index) => (
                                <li key={index} className="w-full">
                                    <NavLink
                                        to={path}
                                        className={({ isActive }) =>`flex w-full items-center gap-3 py-2 rounded-full mb-5 h-10 px-3 ${isActive && isExpanded ? "font-bold bg-primary/10 text-primary" : "px-0 hover:opacity-80 items-center justify-center"}`}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isExpanded ? "-ml-1" : "ml-3 mt-3"} transition-all duration-400 ease-in-out`}>
                                                    <Icon className={isActive ? "text-primary" : "text-secondary"} size={22}/>
                                                </div>
                                                <div className={`flex w-full justify-between items-center transition-all duration-400 ease-in-out ${isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"}`}>
                                                    <span className="text-lg whitespace-nowrap">{label}</span>
                                                    <span className="opacity-70">{count}</span>
                                                </div>
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
            <div className={`mb-4 text-lg text-secondary ${isExpanded ? "mx-10" : "ml-3"} transition-all duration-400 ease-in-out`}>
                <ul className="p-0">
                    <li>
                        <a className="flex items-center gap-3 py-2 cursor-pointer hover:opacity-95">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isExpanded ? "-ml-1" : ""} transition-all duration-400 ease-in-out`}>
                                <FaShareNodes size={22} />
                            </div>
                            <span className={`transition-all duration-400 ease-in-out ${isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"}`}>Share</span>
                        </a>
                    </li>
                    <li>
                        <a className="flex items-center gap-3 py-2 cursor-pointer hover:opacity-95">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isExpanded ? "-ml-1" : ""} transition-all duration-400 ease-in-out`}>
                                <FaGear size={22}/>
                            </div>
                            <span className={`transition-all duration-400 ease-in-out ${isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"}`}>Settings</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default SideBar