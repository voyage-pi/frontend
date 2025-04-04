import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaSistrix } from 'react-icons/fa6';
import Map from "../../Map"; 

const VisitPlaceContent = () => {
  const [selectedLocation, setSelectedLocation] = useState('Barcelona');

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    localStorage.setItem('Location', location);
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem('Location');
    if (savedLocation) {
      setSelectedLocation(savedLocation); 
    }
  }, []);

  const myPolylines = [
    {
      polylines: [
        {
            polylineEncoded: "",
            duration: 0,
            distance: 0
        },
      ],
    },
  ];

  const myMarkers = [
    {
        position: { lat: 32.61402777012159, lng: -8.656425489382625 },
        title: "DETI",
        address: "Universidade de Aveiro, 3810-193 Aveiro",
        image: "https://lh3.googleusercontent.com/p/AF1QipNIoDTmCa7-LUb4p804W_pnaVl6vJOBrl7yFo7H=w408-h255-k-no",
    },
    {
        position: { lat: 40.637322817325355, lng: -8.650697327204432 },
        title: "Santos da Praça",
        address: "Largo da Praça do Peixe 3, 3800-241 Aveiro",
        image: "https://lh3.googleusercontent.com/p/AF1QipM5l6T80v1PyOOVb7PTDCOdp-oiF0BSwNnypcg=w426-h240-k-no",
    }
  ];
  
  const locations = [
    { id: 1, name: 'Barcelona' },
    { id: 2, name: 'Barceloneta Beach Espanha' },
    { id: 3, name: 'Bacelona led 1' },
    { id: 4, name: 'Confeitaria Barcelona By Ayete' }
  ];

  return (
    <div>
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
                onClick={() => handleSelectLocation(location.name)}
              >
                <FaMapMarkerAlt className={`mr-3 ${location.name === selectedLocation ? 'text-white' : 'text-primary'}`} />
                <span>{location.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-blue-50 rounded-lg overflow-hidden h-109 flex-col -mb-10">
          <Map
            polylines={myPolylines}
            markers={myMarkers}
          />
        </div>
      </div>  
    </div>
  );
};

export default VisitPlaceContent;