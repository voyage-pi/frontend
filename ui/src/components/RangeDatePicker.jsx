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

  useEffect(() => {
    setLocalStartDate(startDate);
  }, [startDate]);

  useEffect(() => {
    setLocalEndDate(endDate);
  }, [endDate]);

  useEffect(() => {
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
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    });
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

  return (
    <div className={`range-datepicker ${className}`} ref={datePickerRef}>
      <div className="datepicker-inputs-vertical">
        <div className="datepicker-input-container mb-2">
          <label className="datepicker-label">From</label>
          <input
            type="text"
            className="datepicker-input"
            placeholder={startDatePlaceholder}
            value={localStartDate ? formatDate(localStartDate) : ''}
            readOnly
            onClick={() => openDatePicker('start')}
          />
        </div>
        <div className="datepicker-input-container">
          <label className="datepicker-label">To</label>
          <input
            type="text"
            className="datepicker-input"
            placeholder={endDatePlaceholder}
            value={localEndDate ? formatDate(localEndDate) : ''}
            readOnly
            onClick={() => openDatePicker('end')}
          />
        </div>
      </div>
      
      {(isStartDatePickerOpen || isEndDatePickerOpen) && (
        <div className="datepicker-dropdown">
          {generateCalendar()}
        </div>
      )}
    </div>
  );
};

export default RangeDatePicker; 