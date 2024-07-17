import React, { useState, useEffect, useCallback } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';
import { formatLocalDateTime } from '../utils/DateUtils';
import '../styles/calendar.css'; 

const Calendar = () => {
  const [selectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [days, setDays] = useState([]);
  const { user } = UserAuth(); 
  const [ownEvents, setOwnEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [eventsForCurrentMonth, setEventsForCurrentMonth] = useState({});

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const ownEventData = await getDataFromBackend(`http://localhost:3001/api/events/${user.uid}`);
          const joinedEventData = await getDataFromBackend(`http://localhost:3001/api/events/joined/${user.uid}`);
          
          if (ownEventData) {
            const formattedOwnEvents = ownEventData.map(event => ({
              event_date: formatLocalDateTime(event.event_datetime).slice(0, 10), 
              event_name: event.event_name,
              event_id: event.event_id,
            }));
            console.log("Loaded own Event Data from server:", formattedOwnEvents);
            setOwnEvents(formattedOwnEvents);
          } else {
            setOwnEvents([]);
          }

          if (joinedEventData) {
            const formattedJoinedEvents = joinedEventData.map(event => ({
              event_date: formatLocalDateTime(event.event_datetime).slice(0, 10), 
              event_name: event.event_name,
              event_id: event.event_id,
            }));
            console.log("Loaded joined Event Data from server:", formattedJoinedEvents);
            setJoinedEvents(formattedJoinedEvents);
          } else {
            setJoinedEvents([]);
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
    const ownEventsForDate = ownEvents.filter(event => event.event_date === formattedDate);
    const joinedEventsForDate = joinedEvents.filter(event => event.event_date === formattedDate);
  
    return { ownEvents: ownEventsForDate, joinedEvents: joinedEventsForDate };
  }, [ownEvents, joinedEvents]);

  useEffect(() => {
    const eventsMap = {};
    days.forEach(day => {
      const formattedDate = formatLocalDateTime(day.toISOString()).slice(0, 10); 
      const events = getEventsForDate(day);
      eventsMap[formattedDate] = events;
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
          const eventsForDate = eventsForCurrentMonth[formattedDate] || { ownEvents: [], joinedEvents: [] };
          return (
            <div
              key={date.toISOString()}
              className={`calendar-cell ${isToday(date) ? 'today' : ''} ${selectedDate === formattedDate ? 'selected' : ''}`}
            >
              <time dateTime={formattedDate}>{date.getDate()}</time>
              <div className="event-names">
                {eventsForDate.ownEvents.map(event => (
                  <div key={event.event_id} className="event-name">
                    <h5>
                      <a href={`/EventPage/EventDetailPage/${event.event_id}`} className="event-link">{event.event_name}</a>
                    </h5>
                  </div>                
                ))}
                
                {eventsForDate.joinedEvents.map(event => (
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
        <button className='date-button' onClick={handlePrevMonth}>&lt;</button>
        <button className='date-button' onClick={handleToday}>Today</button>
        <button className='date-button' onClick={handleNextMonth}>&gt;</button>
      </div>
    </div>
  );
};

export default Calendar;
