import React, { useState, useEffect } from 'react';
import VisitPlaceContent from './step3/VisitPlaceContent';
import RoadTripContent from './step3/RoadTripContent';
import ZoneTripContent from './step3/ZoneTripContent';

const Step3Content = () => {
  const [tripType, setTripType] = useState('place'); 

  useEffect(() => {
    const savedTripType = localStorage.getItem('Trip Type');
    if (savedTripType) {
      setTripType(savedTripType);
    }
  }, []);

  return (
    <div className='p-6'>
      {tripType === 'place' && <VisitPlaceContent />}
      {tripType === 'road' && <RoadTripContent />}
      {tripType === 'zone' && <ZoneTripContent />}
    </div>
  );
};

export default Step3Content;