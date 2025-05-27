import React from "react";

function TabBar({ activeTab, setActiveTab, tabs }) {
  return (
    <div className="flex mb-6">
      {tabs.map((tab) => (
        <div 
          key={tab.value}
          className="relative py-1 px-4 text-lg cursor-pointer mx-2 flex items-center justify-center"
          onClick={() => setActiveTab(tab.value)}
        >
          {activeTab === tab.value && (
            <div className="absolute inset-0 bg-primary rounded-full z-0"></div>
          )}
          <span className={`relative z-10 ${activeTab === tab.value ? "text-white" : "text-gray-700"}`}>
            {tab.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default TabBar;