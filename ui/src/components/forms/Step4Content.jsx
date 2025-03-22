import React, { useState, useRef, useEffect } from "react";
import "cally";
import VoyageIcon from "../../assets/voyage-logo.png";

const TravelPlanner = () => {
  const [startDate, setStartDate] = useState("2025-03-25");
  const [endDate, setEndDate] = useState("2025-03-26");
  const [budget, setBudget] = useState(332);

  const startPopoverRef = useRef(null);
  const endPopoverRef = useRef(null);
  const startButtonRef = useRef(null);
  const endButtonRef = useRef(null);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();

  const positionPopover = (buttonRef, popoverRef) => {
    if (buttonRef.current && popoverRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      popoverRef.current.style.position = 'absolute';
      popoverRef.current.style.top = `${buttonRect.bottom + window.scrollY}px`;
      popoverRef.current.style.left = `${buttonRect.left + window.scrollX}px`;
      popoverRef.current.style.zIndex = '100';
    }
  };

  const toggleStartPopover = () => {
    if (startPopoverRef.current) {
      if (startPopoverRef.current.matches(':popover-open')) {
        startPopoverRef.current.hidePopover();
      } else {
        startPopoverRef.current.showPopover();
        positionPopover(startButtonRef, startPopoverRef);
      }
    }
  };

  const toggleEndPopover = () => {
    if (endPopoverRef.current) {
      if (endPopoverRef.current.matches(':popover-open')) {
        endPopoverRef.current.hidePopover();
      } else {
        endPopoverRef.current.showPopover();
        positionPopover(endButtonRef, endPopoverRef);
      }
    }
  };

  useEffect(() => {
    if (startCalendarRef.current) {
      startCalendarRef.current.addEventListener('change', (e) => {
        setStartDate(e.target.value);
        if (startPopoverRef.current) {
          startPopoverRef.current.hidePopover();
        }
      });
    }

    if (endCalendarRef.current) {
      endCalendarRef.current.addEventListener('change', (e) => {
        setEndDate(e.target.value);
        if (endPopoverRef.current) {
          endPopoverRef.current.hidePopover();
        }
      });
    }

    const handleResize = () => {
      if (startPopoverRef.current && startPopoverRef.current.matches(':popover-open')) {
        positionPopover(startButtonRef, startPopoverRef);
      }
      if (endPopoverRef.current && endPopoverRef.current.matches(':popover-open')) {
        positionPopover(endButtonRef, endPopoverRef);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startPopoverRef.current && !startPopoverRef.current.contains(event.target) &&
        startButtonRef.current && !startButtonRef.current.contains(event.target)) {
        startPopoverRef.current.hidePopover();
      }

      if (endPopoverRef.current && !endPopoverRef.current.contains(event.target) &&
        endButtonRef.current && !endButtonRef.current.contains(event.target)) {
        endPopoverRef.current.hidePopover();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto p-15 pb-13">
      {/* Left Column - Dates */}
      <div className="flex-1 border-r border-primary/30 pr-24 ">
        <h2 className="text-2xl font-bold mb-6 text-center">Dates</h2>

        {/* Start Date Picker */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="text-error mr-2">
                <svg xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <button
                  ref={startButtonRef}
                  className="input input-border"
                  onClick={toggleStartPopover}
                >
                  {startDate}
                </button>

                <div
                  ref={startPopoverRef}
                  popover="auto"
                  className="dropdown bg-base-100 rounded-box shadow-lg"
                >
                  <calendar-date
                    ref={startCalendarRef}
                    className="cally"
                    value={startDate}
                  >
                    <svg aria-label="Previous" className="fill-current size-4"
                      slot="previous"
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                    </svg>
                    <svg aria-label="Next" className="fill-current size-4"
                      slot="next"
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                    </svg>
                    <calendar-month />
                  </calendar-date>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Duration visualization */}
        <div className="flex flex-col items-start my-4 pl-3">
          <div className="flex flex-col items-start gap-y-[0.5rem] pl-3">
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            <div className="flex flex-row items-center -ml-3">
              <img src={VoyageIcon} alt="Voyage Logo" className="h-8 w-8" />
              <span className="text-secondary/50 pl-1">{days} days</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>

          </div>
        </div>

        {/* End Date Picker */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="text-error mr-2">
                <svg xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <button
                  ref={endButtonRef}
                  className="input input-border"
                  onClick={toggleEndPopover}
                >
                  {endDate}
                </button>

                <div
                  ref={endPopoverRef}
                  popover="auto"
                  className="dropdown bg-base-100 rounded-box shadow-lg"
                >
                  <calendar-date
                    ref={endCalendarRef}
                    className="cally"
                    value={endDate}
                  >
                    <svg aria-label="Previous" className="fill-current size-4"
                      slot="previous" xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24">
                      <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                    </svg>
                    <svg aria-label="Next" className="fill-current size-4"
                      slot="next" xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24">
                      <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                    </svg>
                    <calendar-month />
                  </calendar-date>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Budget */}
      <div className="flex-1 pl-24">
        <h2 className="text-2xl font-bold mb-6 text-center">Budget</h2>

        <div className="p-4">
          <p className="text-center mb-14">
            Give us the maximum value<br />
            that you would like to spend
          </p>

          <div className="text-center">
            <p className="text-error text-5xl font-bold mb-6">{budget}€</p>

            <input
              type="range"
              min="0"
              max="2500"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="range range-error range-sm"
            />

            <div className="flex justify-between px-2 text-sm">
              <span>0</span>
              <span>2500+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanner;