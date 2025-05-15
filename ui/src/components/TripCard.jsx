import React from "react";
import { FaClock, FaUsers, FaLocationDot, FaEye } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

function TripCard({image, days, people, destinations, name, date, id }) {
  const navigate = useNavigate();

  return (
    <div onClick={() => {
      navigate(`/itinerary/${id}`);
      console.log(id);
    }} className="card w-[15rem] h-[15rem] rounded-xl overflow-hidden shadow-sm relative btn btn-ghost transition-transform duration-300 hover:scale-102 text-start group"
      >
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover absolute"
      />

      
      {/* Animated white overlay */}
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-white via-white/80 to-transparent transform transition-all duration-300 ease-in-out group-hover:h-[70%]"></div>

      <div className="card-body relative z-10 flex flex-col justify-between h-[15rem] p-2 pb-4">
        <div className="flex flex-wrap gap-1">
          <div className="badge bg-white text-gray-800 gap-1 p-2 rounded-md">
            <FaClock className="text-gray-600" />
            <span className="font-bold">{days} <span className="font-normal">days</span> </span>
          </div>

          <div className="badge bg-white text-gray-800 gap-1 p-2 rounded-md">
            <FaUsers className="text-gray-600" />
            <span className="font-bold">{people} <span className="font-normal">people</span></span>
          </div>

          <div className="badge bg-white text-gray-800 gap-1 p-2 rounded-md">
            <FaLocationDot className="text-gray-600" />
            <span className="font-bold">{destinations} <span className="font-normal">destinations</span></span>
          </div>
        </div>
        <div className="mt-auto text-secondary text-left">
          <h2 className="text-xl font-bold mb-1 text-left ">{name}</h2>
          <p className="text-secondary/70 text-left">{date}</p>
        </div>
      </div>
    </div>
  );
}

export default TripCard;
