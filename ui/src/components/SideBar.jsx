import { useState, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
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
import Notification from "./Notification"
import { RiLoginCircleFill } from "react-icons/ri";
import { FaUserPlus, FaSignOutAlt } from "react-icons/fa";
import { useNotifications } from "../context/NotificationsContext";

function SideBar({ onToggle, onMenuItemClick }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isFormsPath = location.pathname === "/forms" || location.pathname === "/itinerary";
    const { totalCount } = useNotifications();
    
    const [isExpanded, setIsExpanded] = useState(() => {
        const storedState = JSON.parse(localStorage.getItem("sidebarState"));
        if (isFormsPath) {
            return false;
        }
        return storedState !== null ? storedState : true;
    });
    
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    
    const isGuest = userData.name === "Guest";

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
        { icon: FaEarthAmericas, label: "Trips", count: userData.stats.trips, path: "/", blockNavigation: false, hasNotification: totalCount > 0 },
        { icon: FaHeart, label: "Saved", count: userData.stats.saved, path: "/saved", blockNavigation: isGuest },
        { icon: FaUsers, label: "Friends", count: userData.stats.friends, path: "/friends", blockNavigation: isGuest, hasNotification: totalCount > 0 },
    ]
    
    const handleMenuItemClick = (item, blockNavigation, e) => {
        
        if (onMenuItemClick) {
            onMenuItemClick(item);
        }
    };

    const handleBottomItemClick = (label) => {
        onMenuItemClick(label);
        
        if (label === "Logout") {
            // Perform logout logic here if needed (clear tokens, etc.)
            navigate("/login");
        } else if (label === "Settings") {
            navigate("/settings");
        }
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <div className={`bg-base-300 h-full fixed top-0 left-0 transition-all duration-400 ease-in-out flex flex-col justify-between ${isExpanded ? "w-64" : "w-16"}`}>
            <div className="flex flex-col">
                <div className="flex items-center justify-between">
                    {isExpanded ? (
                        <div
                            className="m-8 mt-2 flex flex-row transition-all duration-400 ease-in-out"
                        >
                            <div
                                className="-ml-10 flex items-center transition-all duration-400 ease-in-out"
                                onClick={handleLogoClick}
                            >
                                <img 
                                    src={VoyageCompleteLogo} 
                                    alt="Voyage Logo" 
                                    className="max-w-48 transition-all duration-400 ease-in-out cursor-pointer" 
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

                <div
                    className={`flex flex-col ${isExpanded ? "px-8 items-start" : "px-0 items-center"} mt-5 transition-all duration-400 ease-in-out`}
                >
                    {isGuest ? (
                        <div className={`flex flex-col ${isExpanded ? "w-full" : ""}`}>             
                            {isExpanded && (
                                <div className="text-start w-full text-secondary">
                                    <div className="alert bg-primary/5 border border-primary/30 mb-4 p-3 rounded-lg">
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-primary flex-shrink-0 w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <div>
                                                <h3 className="font-semibold text-sm">Guest Mode</h3>
                                                <p className="text-md opacity-80 text-justify">You have limited access to features. Sign in to unlock all the functionalities.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <NavLink to="/login">
                                        <button className="btn btn-primary border-none rounded-full mt-10 w-full flex items-center justify-start gap-3 h-10 shadow-sm transition-all duration-400 ease-in-out">
                                            <RiLoginCircleFill className="text-white text-2xl font-light"> </RiLoginCircleFill>
                                            <span className="text-primary-content text-lg font-bold">Sign In</span>
                                        </button>
                                    </NavLink>
                                    <NavLink to="/register">
                                    <button className="btn btn-outline border-primary rounded-full mt-3 w-full flex items-center justify-start gap-3 h-10 shadow-sm transition-all duration-400 ease-in-out">
                                            <div className=" flex items-center justify-center">
                                                <FaUserPlus className="text-primary text-2xl font-light"> </FaUserPlus>
                                            </div>
                                            <span className="text-primary text-lg font-bold">Register</span>
                                        </button>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Regular user display
                        <>
                            <div className="avatar avatar-placeholder">
                                <div
                                    className={`rounded-full text-primary/90 bg-white border-1 border-white transition-all duration-400 ease-in-out ${isExpanded ? "w-28" : "w-9 mt-20"}`}>
                                    <span className={`${isExpanded ? "text-4xl" : "text-sm"}`}>
                                        <img src={userData.image} alt="User Avatar"/>
                                        </span>
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
                                    <button className="btn btn-primary border-none rounded-full mt-10 w-full flex items-center justify-start gap-3 h-10 shadow-sm transition-all duration-400 ease-in-out">
                                        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center -ml-2">
                                            <span className="text-primary text-2xl font-light">+</span>
                                        </div>
                                        <span className="text-primary-content text-lg font-bold">Create</span>
                                    </button>
                                </NavLink>
                            </div>

                            {!isExpanded && (
                                <NavLink to="/forms">
                                    <button className="btn btn-primary border-none rounded-full mt-51 w-7 h-7 flex items-center justify-center p-0 transition-all duration-400 ease-in-out">
                                        <span className="text-primary-content text-2xl font-light">+</span>
                                    </button>
                                </NavLink>
                            )}

                            <nav className="w-full mt-10 transition-all duration-400 ease-in-out">
                                <ul className="w-full">
                                    {menuItems.map(({ icon: Icon, label, count, path, blockNavigation, hasNotification }, index) => (
                                        <li key={index} className="w-full">
                                            {blockNavigation ? (
                                                <div
                                                    className={`flex w-full items-center gap-3 py-2 rounded-full mb-5 h-10 px-3 ${isExpanded ? "px-3" : "px-0 items-center justify-center"} cursor-pointer hover:opacity-80`}
                                                    onClick={(e) => handleMenuItemClick(label, blockNavigation, e)}
                                                >
                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isExpanded ? "-ml-1" : "ml-3 mt-3"} transition-all duration-400 ease-in-out`}>
                                                        <Icon className="text-secondary" size={22}/>
                                                    </div>
                                                    <div className={`flex w-full justify-between items-center transition-all duration-400 ease-in-out ${isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"}`}>
                                                        <span className="text-lg whitespace-nowrap">{label}</span>
                                                        <span className="opacity-70">{count}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <NavLink
                                                    to={path}
                                                    className={({ isActive }) =>`flex w-full items-center gap-3 py-2 rounded-full mb-5 h-10 px-3 ${isActive && isExpanded ? "font-bold bg-primary/10 text-primary" : "px-0 hover:opacity-80 items-center justify-center"}`}
                                                    onClick={(e) => handleMenuItemClick(label, blockNavigation, e)}
                                                >
                                                    {({ isActive }) => (
                                                        <>
                                                            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${isExpanded ? "-ml-1" : "ml-3 mt-3"} transition-all duration-400 ease-in-out`}>
                                                                <Icon className={isActive ? "text-primary" : "text-secondary"} size={22}/>
                                                                {hasNotification && (
                                                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                                                        {totalCount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className={`flex w-full justify-between items-center transition-all duration-400 ease-in-out ${isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"}`}>
                                                                <span className="text-lg whitespace-nowrap">{label}</span>
                                                                <span className="opacity-70">{count}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </NavLink>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </>
                    )}
                </div>
            </div>

            <div className={`mb-4 text-lg text-secondary ${isExpanded ? "mx-10" : "ml-3"} transition-all duration-400 ease-in-out`}>
                <ul className="p-0">
                    {!isGuest && (
                        <>
                            <li>
                                <a 
                                    className="flex items-center gap-3 py-2 cursor-pointer hover:opacity-95"
                                    onClick={() => handleBottomItemClick("Share")}
                                >
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isExpanded ? "-ml-1" : ""} transition-all duration-400 ease-in-out`}>
                                        <FaShareNodes size={22} />
                                    </div>
                                    <span className={`transition-all duration-400 ease-in-out ${isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"}`}>Share</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    className="flex items-center gap-3 py-2 cursor-pointer hover:opacity-95"
                                    onClick={() => handleBottomItemClick("Logout")}
                                >
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isExpanded ? "-ml-1" : ""} transition-all duration-400 ease-in-out`}>
                                        <FaSignOutAlt size={22} />
                                    </div>
                                    <span className={`transition-all duration-400 ease-in-out ${isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"}`}>Logout</span>
                                </a>
                            </li>
                        </>
                    )}
                    <li>
                        <a 
                            className="flex items-center gap-3 py-2 cursor-pointer hover:opacity-95"
                            onClick={() => handleBottomItemClick("Settings")}
                        >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isExpanded ? "-ml-1" : ""} transition-all duration-400 ease-in-out`}>
                                <FaGear size={22}/>
                            </div>
                            <span className={`transition-all duration-400 ease-in-out ${isExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"}`}>Settings</span>
                        </a>
                    </li>
                </ul>
            </div>
            
            {showNotification && (
                <Notification 
                    message={notificationMessage} 
                    onClose={() => setShowNotification(false)}
                />
            )}
        </div>
    )
}

export default SideBar