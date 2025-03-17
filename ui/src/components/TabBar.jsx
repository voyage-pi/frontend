import React from "react";

function TabBar({ activeTab, setActiveTab, tabs }) {
  const getTabStyle = (tabName) => {
    return activeTab === tabName 
      ? "py-1 px-4 rounded-full bg-primary text-white font-bold cursor-pointer text-lg" 
      : "py-1 px-5 text-gray-700 cursor-pointer text-lg";
  };

  return (
    <div className="flex space-x-4 mb-6">
      {tabs.map((tab) => (
        <div 
          key={tab.value}
          className={getTabStyle(tab.value)} 
          onClick={() => setActiveTab(tab.value)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

export default TabBar;