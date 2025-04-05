import LoadingAnimation from './LoadingAnimation';

function LoadingItinerary() {
  return (
    <div className='text-center justify-center items-center flex flex-col h-screen'>
      <div className="svg-container">
        <LoadingAnimation />
      </div>
      <div className='text-xl font-light text-primary -pt-3'>
        Creating your <span className='font-bold'>itinerary</span>...
      </div>
    </div>
  );
}

export default LoadingItinerary;