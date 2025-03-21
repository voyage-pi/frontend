import React from 'react';
import { 
  FaCircleInfo,     
  FaRoad,
  FaMapMarkerAlt,
} from "react-icons/fa6";
import { PiMapPinAreaFill } from "react-icons/pi";

const Step2Content = () => (
  <div className="text-center p-6 -mb-10">
    <h2 className="text-3xl mb-10">What are you feeling?</h2>
    <div className="flex justify-center space-x-10">
      {/* Visit Place Card */}
      <div className="card bg-white rounded-lg p-6 w-70 h-90 flex flex-col items-center justify-center shadow-[0px_0px_1px_0px] transform transition-transform duration-200 hover:scale-105">
        <div className="absolute top-5 right-5 text-primary/90">
          <FaCircleInfo size={20} />
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <FaMapMarkerAlt size={32} className="text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-primary">Visit Place</h3>
      </div>

      {/* Road Trip Card */}
      <div className="card bg-white rounded-lg p-6  w-70 h-90 flex flex-col items-center justify-center shadow-[0px_0px_1px_0px] transform transition-transform duration-200 hover:scale-105">
        <div className="absolute top-5 right-5 text-primary/90">
          <FaCircleInfo size={20} />
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <FaRoad size={32} className="text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-primary">Road Trip</h3>
      </div>

      {/* Zone Trip Card */}
      <div className="card bg-white rounded-lg p-6  w-70 h-90 flex flex-col items-center justify-center shadow-[0px_0px_1px_0px] transform transition-transform duration-200 hover:scale-105">
        <div className="absolute top-5 right-5 text-primary/90">
          <FaCircleInfo size={20} />
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <PiMapPinAreaFill size={32} className="text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-primary">Zone Trip</h3>
      </div>
    </div>
  </div>
);

export default Step2Content;