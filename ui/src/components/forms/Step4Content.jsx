import React, { useState, useRef, useEffect, useCallback } from "react";
import "cally";
import VoyageIcon from "../../assets/voyage-logo.png";
import RangeSlider from "../RangeSlider";
import RangeDatePicker from "../RangeDatePicker";
import "../../styles/RangeDatePicker.css";
import Notification from "../Notification";

const Step4Content = () => {
  const today = new Date();
  const tomorrow_tomorrow = new Date(today);
  tomorrow_tomorrow.setDate(tomorrow_tomorrow.getDate() + 2);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow_tomorrow);
  const [budget, setBudget] = useState(332);
  const [dateError, setDateError] = useState(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState(0);
  const [activeField, setActiveField] = useState("start");
  const datePickerRef = useRef(null);
  const startFieldRef = useRef(null);
  const endFieldRef = useRef(null);
  const [showDateErrorNotification, setShowDateErrorNotification] = useState(false);

  useEffect(() => {
    const savedStart = localStorage.getItem("Start Date");
    const savedEnd = localStorage.getItem("End Date");
    const savedBudget = localStorage.getItem("Budget");

    if (savedStart && savedEnd) {
      setStartDate(new Date(savedStart));
      setEndDate(new Date(savedEnd));
    }
    if (savedBudget) setBudget(parseInt(savedBudget, 10));
  }, []);

  useEffect(() => {
    // Only save dates to localStorage if they're not null
    if (startDate) {
      localStorage.setItem(
        "Start Date",
        startDate instanceof Date
          ? startDate.toISOString().split("T")[0]
          : startDate
      );
    }
    if (endDate) {
      localStorage.setItem(
        "End Date",
        endDate instanceof Date ? endDate.toISOString().split("T")[0] : endDate
      );
    }
  }, [startDate, endDate]);

  useEffect(() => {
    localStorage.setItem("Budget", budget);
  }, [budget]);

  const handleDateChange = useCallback(
    (start, end) => {
      // If both dates are present and invalid, block update
      if (start && end && start > end) {
        setDateError("End date cannot be earlier than start date");
        setShowDateErrorNotification(true);
        setDateError(true);
        return;
      }
      // If only one date is present, allow update
      if (start) setStartDate(start);
      if (end) setEndDate(end);
      setDateError(null);
    },
    []
  );

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startObj = new Date(start);
    const endObj = new Date(end);
    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) return 0;

    return Math.max(
      1,
      Math.floor((endObj - startObj) / (1000 * 60 * 60 * 24)) + 1
    );
  };
  const days = calculateDays(startDate, endDate);

  useEffect(() => {
    localStorage.setItem("Duration", days);
  }, [days]);

  // Budget
  const handleBudgetChange = (newBudget) => {
    setBudget(newBudget);
    // localStorage update is handled by the effect above
  };

  const handleBudgetInputChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    // Ensure the value stays within the slider's range
    const clampedValue = Math.min(Math.max(value, 0), 2500);
    setBudget(clampedValue);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsCalendarVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openCalendar = (ref, field) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCalendarPosition(rect.top + rect.height + window.scrollY);
    }
    setActiveField(field);
    setIsCalendarVisible(true);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Select a date";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const CalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="date-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF6B81"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  return (
    <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto p-15 pb-12">
      {/* Notification for invalid date range */}
      {showDateErrorNotification && (
        <Notification
          type="error"
          text="End date cannot be earlier than start date."
          onClose={() => setShowDateErrorNotification(false)}
          options={{ position: "top-right", autoClose: 3000, pauseOnHover: false }}
        />
      )}

      {/* Left Column - Dates */}
      <div className="flex-1" ref={datePickerRef}>
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

        <div className="flex flex-col" style={{ position: "relative" }}>
          {/* Start Date */}
          <div
            ref={startFieldRef}
            className="date-field mb-4"
            onClick={() => openCalendar(startFieldRef, "start")}
          >
            <div className="date-label">
              <CalendarIcon />
              <span>Start Date:</span>
            </div>
            <div className="date-value">{formatDate(startDate)}</div>
          </div>

          {/* Timeline visualization between dates */}
          <div className="date-duration-visualizer between-dates mb-2">
            <div className="vertical-timeline">
              <div className="timeline-dot"></div>
              <div className="timeline-dot"></div>
              <div className="timeline-icon-container">
                <img
                  src={VoyageIcon}
                  alt="Voyage Logo"
                  className="timeline-icon"
                />
                <span className="timeline-days">
                  {days} {days === 1 ? "day" : "days"}
                </span>
              </div>
              <div className="timeline-dot"></div>
              <div className="timeline-dot"></div>
            </div>
          </div>

          {/* End Date */}
          <div
            ref={endFieldRef}
            className="date-field mb-4"
            onClick={() => openCalendar(endFieldRef, "end")}
          >
            <div className="date-label">
              <CalendarIcon />
              <span>End Date:</span>
            </div>
            <div className="date-value">{formatDate(endDate)}</div>
          </div>

          {/* Calendar */}
          {isCalendarVisible && (
            <div
              className="inline-calendar-container"
              style={{ top: `${calendarPosition}px` }}
            >
              <div className="calendar-card">
                <RangeDatePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateChange}
                  minDate={new Date(2000, 0, 1)}
                  maxDate={new Date(2100, 0, 1)}
                  className="calendar-only"
                  startWeekDay="monday"
                  highlightToday={false}
                  initialSelecting={activeField}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="divider md:divider-horizontal mx-24"></div>

      {/* Right Column - Budget */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6 text-center">Budget</h2>
        <div className="p-4">
          <p className="text-center mb-14">
            Give us the maximum value
            <br />
            that you would like to spend
          </p>

          {/* ← NEW: parent flex to center everything */}
          <div className="flex justify-center items-baseline mb-2">
            <input
              type="number"
              value={budget}
              onChange={handleBudgetInputChange}
              min="0"
              max="2500"
              className="text-error text-5xl font-bold bg-transparent outline-none focus:outline-none text-right"
              style={{
                /* auto‐size by character count + 1 for padding */
                width: `${budget.toString().length + 1}ch`,
                appearance: 'textfield',
              }}
            />
            <span
              className="text-error text-5xl font-bold pointer-events-none"
              style={{ lineHeight: 1 }}
            >
              €{budget >= 2500 ? '+' : ''}
            </span>
          </div>

          <div className="w-full flex flex-col items-center gap-2">
            <RangeSlider
              value={budget}
              onChange={handleBudgetChange}
              min={0}
              max={2500}
              step={1}
              rangeClassName="range range-error range-sm"
              showLabels={true}
              labelClassName="text-error text-lg font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Content;
