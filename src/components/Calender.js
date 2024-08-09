import React, { useState, useEffect, useCallback } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';
import { formatLocalDateTime } from '../utils/DateUtils';
import { Button } from '@mui/material';
import '../styles/calendar.css'; 

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [days, setDays] = useState([]);
  const { user } = UserAuth(); 
  const [events, setEvents] = useState([]);
  const [eventsForCurrentMonth, setEventsForCurrentMonth] = useState({});

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const response = await getDataFromBackend(`http://localhost:3001/api/calendar/${user.uid}`);
          console.log(response);
          if (response.events) {
            const formattedEvents = response.events.map(event => ({
              event_date: formatLocalDateTime(event.event_datetime).slice(0, 10), 
              event_name: event.event_name,
              event_id: event.event_id,
            }));
            console.log("Loaded own Event Data from server:", formattedEvents);
            setEvents(formattedEvents);
          } else {
            setEvents([]);
          }
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEventData();
  }, [user]);

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = [];

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      daysInMonth.push(new Date(year, month, i));
    }

    setDays(daysInMonth);
  }, [currentMonth]);

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getEventsForDate = useCallback((date) => {
    const formattedDate = formatLocalDateTime(date.toISOString()).slice(0, 10); 
    const eventsForDate = events.filter(event => event.event_date === formattedDate);
  
    return eventsForDate;
  }, [events]);

  useEffect(() => {
    const eventsMap = {};
    days.forEach(day => {
      const formattedDate = formatLocalDateTime(day.toISOString()).slice(0, 10); 
      const eventsForDate = getEventsForDate(day);
      eventsMap[formattedDate] = eventsForDate;
    });
    setEventsForCurrentMonth(eventsMap);
  }, [days, getEventsForDate]);

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
        {days.map(date => {
          const formattedDate = formatLocalDateTime(date.toISOString()).slice(0, 10); 
          const eventsForDate = eventsForCurrentMonth[formattedDate] || [];
          return (
            <div
              key={date.toISOString()}
              className={`calendar-cell ${isToday(date) ? 'today' : ''} ${selectedDate === formattedDate ? 'selected' : ''}`}
              onClick={() => setSelectedDate(formattedDate)}
            >
              <time dateTime={formattedDate}>{date.getDate()}</time>
              <div className="event-names">
                {eventsForDate.map(event => (
                  <div key={event.event_id} className="event-name">
                    <h5>
                      <a href={`/EventPage/EventDetailPage/${event.event_id}`} className="event-link">{event.event_name}</a>
                    </h5>
                  </div>                
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className='calendar-navigation'>
        <Button variant='contained' className='date-button' onClick={handlePrevMonth}>&lt;</Button>
        <Button variant='contained' onClick={handleToday}>Today</Button>
        <Button variant='contained' onClick={handleNextMonth}>&gt;</Button>
      </div>
    </div>
  );
};

export default Calendar;
