import React from "react";

function TabBar({ activeTab, setActiveTab, tabs }) {
  const getTabStyle = (tabName) => {
    const baseStyle = "py-1 px-4 text-lg cursor-pointer flex items-center justify-center";
    const activeStyle = activeTab === tabName ? "rounded-full bg-primary text-white font-bold" : "text-gray-700";
    return `${baseStyle} ${activeStyle}`;
  };

return (
    <div className="flex mb-6">
        {tabs.map((tab) => (
            <div 
                key={tab.value}
                className={`${getTabStyle(tab.value)} ${tab.label === "All trips" ? "w-25" : "w-27"} mx-2`}
                onClick={() => setActiveTab(tab.value)}
            >
                {tab.label}
            </div>
        ))}
    </div>
);
}

export default TabBar;