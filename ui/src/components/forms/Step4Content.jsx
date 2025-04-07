import React, { useState, useRef, useEffect, useCallback } from "react";
import "cally";
import VoyageIcon from "../../assets/voyage-logo.png";
import RangeSlider from "../RangeSlider";

const Step4Content = () => {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [budget, setBudget] = useState(332);
  const [dateError, setDateError] = useState(null);

  const startPopoverRef = useRef(null);
  const endPopoverRef = useRef(null);
  const startButtonRef = useRef(null);
  const endButtonRef = useRef(null);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);

  useEffect(() => {
    const savedStart = localStorage.getItem("Start Date");
    const savedEnd = localStorage.getItem("End Date");
    const savedBudget = localStorage.getItem("Budget");

    if (savedStart) setStartDate(savedStart);
    if (savedEnd) setEndDate(savedEnd);
    if (savedBudget) setBudget(parseInt(savedBudget, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem("Start Date", startDate);
    localStorage.setItem("End Date", endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    localStorage.setItem("Budget", budget);
  }, [budget]);

  const validateDates = useCallback((start, end) => {
    const startObj = new Date(start + "T00:00:00");
    const endObj = new Date(end + "T00:00:00");

    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      setDateError("Invalid date format. Please use YYYY-MM-DD.");
      return false;
    }

    if (startObj > endObj) {
      setDateError("End date cannot be earlier than start date");
      return false;
    }

    setDateError(null);
    return true;
  }, []);

  const handleDateChange = useCallback(
    (newDate, isStart) => {
      if (!newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        alert("Please select a valid date in YYYY-MM-DD format");
        return;
      }

      if (isStart) {
        if (!validateDates(newDate, endDate)) {
          setStartDate(newDate);
          setEndDate(newDate);
        } else {
          setStartDate(newDate);
        }
      } else {
        if (!validateDates(startDate, newDate)) {
          setEndDate(newDate);
          setStartDate(newDate);
        } else {
          setEndDate(newDate);
        }
      }
    },
    [endDate, startDate, validateDates]
  );

  useEffect(() => {
    const startCal = startCalendarRef.current;
    const endCal = endCalendarRef.current;

    if (!startCal || !endCal) return;

    const onStartChange = (e) => handleDateChange(e.target.value, true);
    const onEndChange = (e) => handleDateChange(e.target.value, false);

    startCal.addEventListener("change", onStartChange);
    endCal.addEventListener("change", onEndChange);

    return () => {
      startCal.removeEventListener("change", onStartChange);
      endCal.removeEventListener("change", onEndChange);
    };
  }, [handleDateChange]);

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

  // Calculate total days
  const calculateDays = (start, end) => {
    const startObj = new Date(start + "T00:00:00");
    const endObj = new Date(end + "T00:00:00");
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

        {/* Start Date Picker */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="text-error mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2
                       0 002-2V7a2 2 0 00-2-2H5a2 2
                       0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <button
                  ref={startButtonRef}
                  className="input input-border w-full"
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
                    <svg
                      aria-label="Previous"
                      className="fill-current size-4"
                      slot="previous"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    <svg
                      aria-label="Next"
                      className="fill-current size-4"
                      slot="next"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
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
              <span className="text-secondary/50 pl-1">
                {days} {days === 1 ? "day" : "days"}
              </span>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2
                       0 002-2V7a2 2 0 00-2-2H5a2 2
                       0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <button
                  ref={endButtonRef}
                  className="input input-border w-full"
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
                    <svg
                      aria-label="Previous"
                      className="fill-current size-4"
                      slot="previous"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    <svg
                      aria-label="Next"
                      className="fill-current size-4"
                      slot="next"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
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
