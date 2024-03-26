import React, { useState, useEffect } from 'react';
import '../styles/eventpage.css'; 
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const { user } = UserAuth(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const data = await getDataFromBackend(`http://localhost:3001/api/events/${user.uid}`);
          console.log("Loaded data from server:", data);
          setEvents([data]);
        }  
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div>
      <div className="event-container">
        <div className="column">
          <h2>Next Events</h2>
          <ul className="events" id="next-events">
            {/* Next events content */}
          </ul>
        </div>
        <div className="column">
          <h2>Last Events</h2>
          <ul className="events" id="last-events">
            {/* Last events content */}
          </ul>
        </div>
        <div className="column">
          <h2>My Events</h2>
          <a href="/EventFormpage"><button className="add-event-button">Add Own Event</button></a>
          {events && events.length > 0 ? (
            <ul className="events" id="manage-events">
              {events.map((event, index) => (
                <li key={index}>
                  <div className="event-card">
                    <div className="card-info">
                      <div className="event-info">                                
                        <h5><a href={`/eventpage/${event.event_id}`} className="event-link">{event.event_name}</a></h5> 
                        <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                        <p>Time: {new Date(event.event_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p>Location: {event.location}</p>
                        <p>Description: {event.description}</p>
                        <p>Max Guests: {event.max_guests}</p>
                        <p>Current Guests: {event.current_guests}</p>
                        {/* You can render other event details here */}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No events found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;
