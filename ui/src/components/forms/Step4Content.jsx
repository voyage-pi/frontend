import React, { useState, useRef, useEffect, useCallback } from "react";
import "cally";
import VoyageIcon from "../../assets/voyage-logo.png";
import RangeSlider from "../RangeSlider";
import RangeDatePicker from "../RangeDatePicker";

const Step4Content = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [budget, setBudget] = useState(332);
  const [dateError, setDateError] = useState(null);

  const startPopoverRef = useRef(null);
  const endPopoverRef = useRef(null);
  const startButtonRef = useRef(null);
  const endButtonRef = useRef(null);

  useEffect(() => {
    const savedStart = localStorage.getItem("Start Date");
    const savedEnd = localStorage.getItem("End Date");
    const savedBudget = localStorage.getItem("Budget");

    if (savedStart) setStartDate(new Date(savedStart));
    if (savedEnd) setEndDate(new Date(savedEnd));
    if (savedBudget) setBudget(parseInt(savedBudget, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem("Start Date", startDate instanceof Date ? startDate.toISOString().split("T")[0] : startDate);
    localStorage.setItem("End Date", endDate instanceof Date ? endDate.toISOString().split("T")[0] : endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    localStorage.setItem("Budget", budget);
  }, [budget]);

  const handleDateChange = useCallback((start, end) => {
    setStartDate(start || today);
    if (end) setEndDate(end);
    
    if (start && end && start > end) {
      setDateError("End date cannot be earlier than start date");
    } else {
      setDateError(null);
    }
  }, [today]);

  // Calculate total days
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startObj = new Date(start);
    const endObj = new Date(end);
    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) return 0;
    return Math.max(1, Math.ceil((endObj - startObj) / (1000 * 60 * 60 * 24)));
  };
  const days = calculateDays(startDate, endDate);

  // Persist # of days in localStorage
  useEffect(() => {
    localStorage.setItem("Duration", days);
  }, [days]);

  // Budget
  const handleBudgetChange = (newBudget) => {
    setBudget(newBudget);
    // localStorage update is handled by the effect above
  };

  const positionPopover = (buttonRef, popoverRef) => {
    if (buttonRef.current && popoverRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      popoverRef.current.style.position = "absolute";
      popoverRef.current.style.top = `${buttonRect.bottom + window.scrollY}px`;
      popoverRef.current.style.left = `${buttonRect.left + window.scrollX}px`;
      popoverRef.current.style.zIndex = "100";
    }
  };

  const toggleStartPopover = () => {
    if (!startPopoverRef.current) return;

    if (startPopoverRef.current.matches(":popover-open")) {
      startPopoverRef.current.hidePopover();
    } else {
      startPopoverRef.current.showPopover();
      positionPopover(startButtonRef, startPopoverRef);
    }
  };

  const toggleEndPopover = () => {
    if (!endPopoverRef.current) return;

    if (endPopoverRef.current.matches(":popover-open")) {
      endPopoverRef.current.hidePopover();
    } else {
      endPopoverRef.current.showPopover();
      positionPopover(endButtonRef, endPopoverRef);
    }
  };

  // Listen for window resize only once
  useEffect(() => {
    const handleResize = () => {
      if (
        startPopoverRef.current &&
        startPopoverRef.current.matches(":popover-open")
      ) {
        positionPopover(startButtonRef, startPopoverRef);
      }
      if (
        endPopoverRef.current &&
        endPopoverRef.current.matches(":popover-open")
      ) {
        positionPopover(endButtonRef, endPopoverRef);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close popovers if the user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        startPopoverRef.current &&
        !startPopoverRef.current.contains(event.target) &&
        !startButtonRef.current.contains(event.target)
      ) {
        startPopoverRef.current.hidePopover();
      }
      if (
        endPopoverRef.current &&
        !endPopoverRef.current.contains(event.target) &&
        !endButtonRef.current.contains(event.target)
      ) {
        endPopoverRef.current.hidePopover();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto p-15 pb-12">
      {/* Left Column - Dates */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6 text-center">Dates</h2>

        {/* Date Error Message */}
        {dateError && (
          <div className="alert alert-error mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2
                   m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{dateError}</span>
          </div>
        )}

        {/* Custom Range Date Picker */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body p-4">
            <RangeDatePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => handleDateChange(start, end)}
              minDate={new Date(2000, 0, 1)}
              maxDate={new Date(2100, 0, 1)}
              dateFormat="D"
              monthFormat="MMM YYYY"
              startDatePlaceholder="Start Date"
              endDatePlaceholder="End Date"
              className="w-full"
              startWeekDay="monday"
              highlightToday={true}
            />
          </div>
        </div>

        {/* Duration visualization */}
        <div className="flex flex-col items-start my-4 pl-3">
          <div className="flex flex-col items-start gap-y-[0.5rem] pl-3">
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            <div className="flex flex-row items-center -ml-3">
              <img src={VoyageIcon} alt="Voyage Logo" className="h-8 w-8" />
              <span className="text-secondary/50 pl-1">
                {days} {days === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
          </div>
        </div>
      </div>

      {/* Right Column - Budget */}
      {/* 
        <div className="flex-1 pl-24">
          <h2 className="text-2xl font-bold mb-6 text-center">Budget</h2>
          <div className="p-4">
            <p className="text-center mb-14">
              Give us the maximum value<br/>
              that you would like to spend
            </p>

            <RangeSlider
              value={budget}
              onChange={handleBudgetChange}
              min={0}
              max={2500}
              step={1}
              currency="€"
              rangeClassName="range range-error range-sm"
              valueClassName="text-error text-5xl font-bold mb-6"
            />
          </div>
        </div>
      */}
    </div>
  );
};

export default Step4Content;
