import React, { useState, useEffect } from 'react';
import VisitPlaceContent from './step3/VisitPlaceContent';
import RoadTripContent from './step3/RoadTripContent';
import ZoneTripContent from './step3/ZoneTripContent';
import Notification from '../Notification';

const Step3Content = ({ setCurrentStep,setDisableButton }) => {
  const [tripType, setTripType] = useState('place'); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedTripType = localStorage.getItem('Trip Type');
    if (savedTripType) {
      setTripType(savedTripType);
    }
    
    // Override the setCurrentStep function to add validation
    const originalSetCurrentStep = setCurrentStep;
    setCurrentStep = (step) => {
      // Only validate when trying to go to the next step (step > 3)
      if (step > 3) {
        const location = localStorage.getItem('Location');
        
        if (!location) {
          setError('Please select a location before proceeding');
          return;
        }
        
        // Additional validation for road trip
        if (tripType === 'road') {
          const origin = localStorage.getItem('origin');
          const destination = localStorage.getItem('destination');
          if (!origin || !destination) {
            setError('Please select both origin and destination for your road trip');
            return;
          }
        }
        
        // Additional validation for zone trip
        if (tripType === 'zone') {
          const radius = localStorage.getItem('radius');
          if (!radius) {
            setError('Please select a radius for your zone trip');
            return;
          }
        }
      }
      
      // If validation passes, call the original function
      originalSetCurrentStep(step);
    };
  }, [tripType, setCurrentStep]);

  return (
    <div className='p-6'>
      {error && (
        <Notification
          type="error"
          text={error}
          onClose={() => setError(null)}
        />
      )}
      
      {tripType === 'place' && <VisitPlaceContent setDisableButton={setDisableButton} />}
      {tripType === 'road' && <RoadTripContent    setDisableButton={setDisableButton} />}
      {tripType === 'zone' && <ZoneTripContent    setDisableButton={setDisableButton} />}
    </div>
  );
};

export default Step3Content;