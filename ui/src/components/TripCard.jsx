import React from "react";
import { FaClock, FaUsers, FaLocationDot, FaEye } from "react-icons/fa6";

function TripCard({ image, days, people, destinations, name, date }) {
  return (
    <div className="card w-[15rem] h-[15rem] rounded-xl overflow-hidden shadow-sm relative">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover absolute"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1)_0%,transparent_40%,rgba(255,255,255,0.7)_70%,rgba(255,255,255,1)_100%)]"></div>

      <div className="card-body relative z-10 flex flex-col justify-between h-[15rem] p-2 pb-6">
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

        <div className="absolute right-2">
          <button className="btn btn-circle btn-xs bg-gray-700/70 text-white border-none hover:bg-gray-600">
            <FaEye className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-auto text-secondary">
          <h2 className="text-2xl font-bold mb-1">{name}</h2>
          <p className="text-secondary/70">{date}</p>
        </div>
      </div>
    </div>
  );
}

export default TripCard;
