import React from 'react';
import SideBar from './SideBar';

const Layout = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);

  const handleSidebarToggle = (isExpanded) => {
    setIsSidebarExpanded(isExpanded);
  };

  const handleMenuItemClick = (item) => {
    console.log('Menu item clicked:', item);
    // Additional logic if needed
  };

  return (
    <div className="flex h-screen">
      <SideBar 
        onToggle={handleSidebarToggle} 
        onMenuItemClick={handleMenuItemClick} 
      />
      <main className={`flex-1 transition-all duration-400 ease-in-out ${isSidebarExpanded ? 'ml-64' : 'ml-16'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 