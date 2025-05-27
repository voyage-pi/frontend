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

    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {children}
    </>
  );
}

export default AppContainer;
