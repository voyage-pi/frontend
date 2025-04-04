import { useState, useEffect } from 'react';

function Loading() {
  return (
    <div className='text-center justify-center items-center flex flex-col h-screen'>
      <div className="svg-container">
        <svg width="200" height="200" viewBox="0 0 738 508" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="XMLID_102_">
            <path id="air_m" d="M6.5 402.75L101.375 371.85" stroke="#FE385C" stroke-width="12" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path id="air_t" d="M6.5 103.2L151.375 54.35" stroke="#FE385C" stroke-width="12" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path id="air_b" d="M82.225 501.3L226.375 454.35" stroke="#FE385C" stroke-width="12" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <g id="plane">
              <path id="XMLID_144_" d="M328.95 352.225L295.475 446.4C292 456.175 301.25 465.675 311.1 462.475L342.55 452.275C345.05 451.45 347.25 449.875 348.775 447.75L495.125 247.5" stroke="#FE385C" stroke-width="12" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
              <path id="XMLID_1011_" d="M608.925 103.85L471.275 148.575L271.925 8.32502C268.775 5.92502 264.675 5.42502 260.875 6.67502L222.6 19.1C215 21.6 211.675 30.8 215.975 37.55L316.725 198.8L163.85 248.45C147.925 253.65 130.625 250.6 117.5 240.125L72.925 204.925C69.7 202.325 65.275 201.625 61.25 202.95L37 210.8C28.675 213.525 25.6 223.45 31 230.375L79.7 293.675C112.2 335.425 167.175 352.525 217.325 336.225L709.025 176.45C726.15 170.875 735.45 152.6 729.875 135.5C726.5 125.075 718.175 117.25 707.675 114.075L666.875 102.625C647.8 97.275 627.725 97.75 608.925 103.85Z" stroke="#FE385C" stroke-width="12" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </g>
        </svg>
      </div>
      <div className='text-xl font-light text-primary -pt-3'>
        Creating your <span className='font-bold'>itinerary</span>...
      </div>
      
      <style jsx>{`
        @keyframes shake-vertical-normal {
          0%, 100% { transform: translateY(0); } 
          10%, 30%, 50%, 70% { transform: translateY(-8px); } 
          20%, 40%, 60% { transform: translateY(8px); } 
          80% { transform: translateY(6.4px); } 
          90% { transform: translateY(-6.4px);}
        }
        
        @keyframes slide-tr-reverse {
          0% { transform: translateY(-50px) translateX(50px); opacity: 0;} 
          25% { opacity: 0.2;}
          50% { transform: translateY(0) translateX(0); opacity: 1;}
          100% { transform: translateY(50px) translateX(-100px); opacity: 0;} 
        }
        
        #plane {
          width: 50%;
          animation: shake-vertical-normal 5s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0s infinite normal none; 
        }
        
        #air_b {
          animation: slide-tr-reverse 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0s infinite normal none; 
        }
        
        #air_t {
          animation: slide-tr-reverse 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) .2s infinite normal none; 
        }
        
        #air_m {
          animation: slide-tr-reverse 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) .3s infinite normal none; 
        }
      `}</style>
    </div>
  );
}

export default Loading;