import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';
import Button from '@mui/material/Button';
import '../styles/eventpage.css';

const Home = () => {
  const { user } = UserAuth();
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const publicEventsData = await getDataFromBackend('http://localhost:3001/api/public/events');
          console.log("Loaded public Event Data from server:", publicEventsData);
          setPublicEvents(publicEventsData ? [publicEventsData] : []);
          setLoading(false); 
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        setLoading(false); 
      }
    };

    fetchEventData();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>; 
  }

  return (
    <div>
      <div className="event-container">
        <div className="column">
          <h2>Public Events</h2>
          {publicEvents[0] ? (
            <ul className="events" id="next-events">
              {publicEvents[0].map((event, index) => (
                <li key={index}>
                  <div className="event-card">
                    <div className="card-info">
                      <div className="event-info">
                        <h5><a href={`/EventPage/EventDetailPage/${event.event_id}`} className="event-link">{event.event_name}</a></h5>
                        <p>Creator: {event.creator_username}</p>
                        <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                        <p>Time: {event.event_time}</p>
                        <p>Location: {event.location}</p>
                        <p>Current Guests: {event.current_guests_count}</p>
                        <p>Maximum Number of Guests: {event.max_guests_count}</p>
                        <p>Info: {event.description}</p>
                      </div>
                      <a href={`/EventPage/EventDetailPage/${event.event_id}`}>
                        <Button variant="contained" >Details</Button >
                      </a>
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
}

export default Home;


