import { useState, useEffect } from 'react';
import LoadingGif from "../assets/loading.gif"

function Loading() {
  
  return (
    <div className='text-center justify-center items-center flex flex-col h-screen'>
        <img src={LoadingGif} alt="Loading..." />
        <div className='text-xl font-light text-primary -pt-3'>
         Creating your <span className='font-bold'>itinerary</span>...
        </div>
    </div>
  );
}

export default Loading;
