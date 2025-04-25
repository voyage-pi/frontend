import React, { useState, useRef, useEffect, useCallback } from "react";
import "cally";
import VoyageIcon from "../../assets/voyage-logo.png";
import RangeSlider from "../RangeSlider";
import RangeDatePicker from "../RangeDatePicker";
import "../../styles/RangeDatePicker.css";
import Notification from "../Notification";

const Step4Content = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [budget, setBudget] = useState(332);
  const [dateError, setDateError] = useState(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [activeField, setActiveField] = useState("start");
  const datePickerRef = useRef(null);
  const startFieldRef = useRef(null);
  const endFieldRef = useRef(null);

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
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    // Check if start date is before today
    if (start && start < todayDate) {
      setNotificationMessage("You cannot select a start date in the past");
      setShowNotification(true);
      return;
    }
    
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
    
    return Math.max(1, Math.floor((endObj - startObj) / (1000 * 60 * 60 * 24)) + 1);
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

  // Click outside handler for calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsCalendarVisible(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open calendar and calculate position
  const openCalendar = (ref, field) => {
    // Get the position of the clicked element
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCalendarPosition(rect.top + rect.height + window.scrollY);
    }
    setActiveField(field);
    setIsCalendarVisible(true);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
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
      {showNotification && (
        <Notification
          type="warning"
          text={notificationMessage}
          onClose={handleNotificationClose}
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

        <div className="flex flex-col" style={{ position: 'relative' }}>
          {/* Start Date */}
          <div 
            ref={startFieldRef}
            className="date-field mb-4" 
            onClick={() => openCalendar(startFieldRef, 'start')}
          >
            <div className="date-label">
              <CalendarIcon />
              <span>Start Date:</span>
            </div>
            <div className="date-value">
              {formatDate(startDate)}
            </div>
          </div>

          {/* Timeline visualization between dates */}
          {startDate && endDate && days > 0 && (
            <div className="date-duration-visualizer between-dates mb-2">
              <div className="vertical-timeline">
                <div className="timeline-dot"></div>
                <div className="timeline-dot"></div>
                <div className="timeline-icon-container">
                  <img src={VoyageIcon} alt="Voyage Logo" className="timeline-icon" />
                  <span className="timeline-days">{days} {days === 1 ? "day" : "days"}</span>
                </div>
                <div className="timeline-dot"></div>
                <div className="timeline-dot"></div>
              </div>
            </div>
          )}

          {/* End Date */}
          <div 
            ref={endFieldRef}
            className="date-field mb-4" 
            onClick={() => openCalendar(endFieldRef, 'end')}
          >
            <div className="date-label">
              <CalendarIcon />
              <span>End Date:</span>
            </div>
            <div className="date-value">
              {formatDate(endDate)}
            </div>
          </div>

          {/* Calendar - using fixed positioning with calculated top position */}
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
                  highlightToday={true}
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
    
    </div>
  );
};

export default Step4Content;
