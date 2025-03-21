import React, { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaSistrix } from 'react-icons/fa6';

const Step3Content = () => {
  const [selectedLocation, setSelectedLocation] = useState('Barcelona');

  const locations = [
    { id: 1, name: 'Barcelona' },
    { id: 2, name: 'Barceloneta Beach Espanha' },
    { id: 3, name: 'Bacelona led 1' },
    { id: 4, name: 'Confeitaria Barcelona By Ayete' }
  ];

  return (
    <div className='p-6'>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side - Location Selection */}
        <div className="flex-1">
          <h2 className="text-3xl mb-10 text-center">
            Choose a <span className="text-primary">location</span> to go to!
          </h2>
          {/* Search Box */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FaSistrix className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              className="pl-10 p-3 w-full border border-gray-200 rounded-lg focus:outline-none"
              placeholder="Barcelona"
            />
          </div>

          <div className="space-y-3">
            {locations.map(location => (
              <div
                key={location.id}
                className={`flex items-center p-3 rounded-lg text-lg cursor-pointer ${location.name === selectedLocation ? 'bg-primary text-white' : 'bg-gray-50'
                  }`}
                onClick={() => setSelectedLocation(location.name)}
              >
                <FaMapMarkerAlt className={`mr-3 ${location.name === selectedLocation ? 'text-white' : 'text-primary'}`} />
                <span>{location.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-blue-50 rounded-lg overflow-hidden h-109 flex-col -mb-10">
          <div className="text-center">
            <div className="text-md font-light text-gray-500 pt-10">[Map View]</div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default Step3Content;