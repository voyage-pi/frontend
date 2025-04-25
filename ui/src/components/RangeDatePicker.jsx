import React, { useState, useEffect, useRef } from 'react';
import "../styles/RangeDatePicker.css";

const RangeDatePicker = ({
  startDate,
  endDate,
  onChange,
  minDate = new Date(1900, 0, 1),
  maxDate = new Date(2100, 0, 1),
  startDatePlaceholder = 'Start Date',
  endDatePlaceholder = 'End Date',
  className = '',
  startWeekDay = 'monday',
  highlightToday = false
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate || null);
  const [localEndDate, setLocalEndDate] = useState(endDate || null);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selecting, setSelecting] = useState('start'); // 'start' or 'end'
  const datePickerRef = useRef(null);
  
  const isCalendarOnly = className?.includes('calendar-only');

  useEffect(() => {
    setLocalStartDate(startDate);
  }, [startDate]);

  useEffect(() => {
    setLocalEndDate(endDate);
  }, [endDate]);

  // Only add click outside handler for the standard mode (not calendar-only)
  useEffect(() => {
    if (isCalendarOnly) return;
    
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsStartDatePickerOpen(false);
        setIsEndDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOnly]);

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const generateCalendarDays = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const dayOffset = startWeekDay === 'monday' ? (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1) : firstDayOfMonth;
    
    const days = [];
    for (let i = 0; i < dayOffset; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        day: i,
        date,
        isCurrentMonth: true,
        isToday: highlightToday && isDateToday(date),
        isDisabled: date < minDate || date > maxDate,
        isStartDate: isDateEqual(date, localStartDate),
        isEndDate: isDateEqual(date, localEndDate),
        isInRange: isDateInRange(date, localStartDate, localEndDate)
      });
    }
    
    return days;
  };

  const isDateToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isDateEqual = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  const isDateInRange = (date, startDate, endDate) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const prevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const nextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const handleDayClick = (date) => {
    if (selecting === 'start') {
      const newStartDate = date;
      setLocalStartDate(newStartDate);
      
      setLocalEndDate(null);
      
      setSelecting('end');
      onChange(newStartDate, null);
    } else {
      const newEndDate = date;
      
      if (localStartDate && newEndDate < localStartDate) {
        setLocalStartDate(newEndDate);
        setLocalEndDate(null);
        setSelecting('end');
        onChange(newEndDate, null);
      } else {
        setLocalEndDate(newEndDate);
        onChange(localStartDate, newEndDate);
      }
    }
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysOfWeek = () => {
    const days = startWeekDay === 'monday' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="datepicker-days-header">
        {days.map((day, index) => (
          <div key={index} className="datepicker-day-name">{day}</div>
        ))}
      </div>
    );
  };

  const openDatePicker = (type) => {
    if (type === 'start') {
      setSelecting('start');
      setIsStartDatePickerOpen(true);
      setIsEndDatePickerOpen(false);
      if (localStartDate) {
        setCurrentMonth(new Date(localStartDate));
      }
    } else {
      setSelecting('end');
      setIsEndDatePickerOpen(true);
      setIsStartDatePickerOpen(false);
      if (localEndDate) {
        setCurrentMonth(new Date(localEndDate));
      } else if (localStartDate) {
        setCurrentMonth(new Date(localStartDate));
      }
    }
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = generateCalendarDays(year, month);
    
    return (
      <div className="datepicker-calendar">
        <div className="datepicker-header">
          <button onClick={prevMonth} className="datepicker-nav-btn">
            &lt;
          </button>
          <div className="datepicker-month">
            {getMonthName(currentMonth)}
          </div>
          <button onClick={nextMonth} className="datepicker-nav-btn">
            &gt;
          </button>
        </div>
        {getDaysOfWeek()}
        <div className="datepicker-days-container">
          {days.map((day, i) => (
            <div 
              key={i} 
              className={`datepicker-day ${!day.isCurrentMonth ? 'datepicker-day-outside' : ''} 
                         ${day.isToday ? 'datepicker-day-today' : ''} 
                         ${day.isDisabled ? 'datepicker-day-disabled' : ''} 
                         ${day.isStartDate ? 'datepicker-day-selected datepicker-day-start' : ''} 
                         ${day.isEndDate ? 'datepicker-day-selected datepicker-day-end' : ''} 
                         ${day.isInRange && !day.isStartDate && !day.isEndDate ? 'datepicker-day-in-range' : ''}`}
              onClick={() => day.isCurrentMonth && !day.isDisabled && handleDayClick(day.date)}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
    );
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
    <div className={`range-datepicker ${className}`} ref={datePickerRef}>
      {!isCalendarOnly && (
        <div className="datepicker-inputs-vertical">
          <div className="date-field mb-2">
            <div className="date-label">
              <CalendarIcon />
              <span>Start Date:</span>
            </div>
            <div 
              className="date-value" 
              onClick={() => openDatePicker('start')}
            >
              {localStartDate ? formatDate(localStartDate) : startDatePlaceholder}
            </div>
          </div>
          
          <div className="date-field">
            <div className="date-label">
              <CalendarIcon />
              <span>End Date:</span>
            </div>
            <div 
              className="date-value" 
              onClick={() => openDatePicker('end')}
            >
              {localEndDate ? formatDate(localEndDate) : endDatePlaceholder}
            </div>
          </div>
        </div>
      )}
      
      {(isStartDatePickerOpen || isEndDatePickerOpen || isCalendarOnly) && (
        <div className="datepicker-dropdown">
          {generateCalendar()}
        </div>
      )}
    </div>
  );
};

export default RangeDatePicker; 