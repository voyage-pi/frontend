import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { routesList } from "./routes.jsx";

import { useState, useEffect } from 'react';

function AppContainer({ children }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.screen.width;
      let newScale = 1;
      
      if (width > 1600) {
        newScale = 1;
      } else if (width > 1200) {
        newScale = 0.9;
      } else if (width > 800) {
        newScale = 0.8;
      }
      
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      style={{ 
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100/scale}%`,
        height: `${100/scale}vh`
      }}
    >
      {children}
    </div>
  );
}

// Create the router
const router = createBrowserRouter(routesList);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppContainer>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </AppContainer>
  </React.StrictMode>
);
