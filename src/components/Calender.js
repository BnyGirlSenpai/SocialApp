import React, { useState, useEffect } from 'react';
import '../styles/calender.css'; 

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [days, setDays] = useState([]);

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = [];

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      daysInMonth.push(new Date(year, month, i));
    }

    setDays(daysInMonth);
  }, [currentMonth]);

  const handleDateClick = (date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    alert(`You selected ${date.toDateString()}`);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className='calendar'>

      <div className='calendar-header'>
        <h1>{currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}</h1>
      </div>

      <div className='calendar-grid'>
        {days.map(date => (
          <div
            key={date}
            className={`calendar-cell ${isToday(date) ? 'today' : ''} ${selectedDate === date.toISOString().split('T')[0] ? 'selected' : ''}`}
            onClick={() => handleDateClick(date)}
          >
            <time dateTime={date.toISOString().split('T')[0]}>{date.getDate()}</time>
          </div>
        ))}
      </div>
      <div className='calender-navigation'>
        <button className='date-button' onClick={handlePrevMonth}>&lt;</button>
        <button className='date-button' onClick={handleToday}>Today</button>
        <button className='date-button' onClick={handleNextMonth}>&gt;</button>
      </div>
    </div>
  );
};

export default Calendar;
