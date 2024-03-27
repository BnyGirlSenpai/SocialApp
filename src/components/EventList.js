import React, { useState, useEffect } from 'react';
import '../styles/eventpage.css'; 
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const { user } = UserAuth(); 

  useEffect(() => {
    const fetchCurrentUserEventData = async () => {
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
    fetchCurrentUserEventData();
  }, [user]);

  // Function to join an event
  function joinEvent(eventId) {
    // Implement joining event functionality here
    console.log("Joined event with ID:", eventId);
  }

  // Function to leave an event
  function leaveEvent(eventId) {
    // Implement leaving event functionality here
    console.log("Left event with ID:", eventId);
  }

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
           {events[0].map((event, index) => (
             <li key={index}>
               <div className="event-card">
                 <div className="card-info">
                   <div className="event-info">                                
                     <h5><a href={`/EventPage/DetailView/${event.event_id}`} className="event-link">{event.event_name}</a></h5> 
                     <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                     <p>Time: {event.event_time.substring(0, 5)}</p>
                     <p>Location: {event.location}</p>
                     <p>Description: {event.description}</p>
                     <p>Max Guests: {event.max_guests_count}</p>
                     <p>Current Guests: {event.current_guests_count}</p>
                     {/* You can render other event details here */}
                   </div>
                   <div className="button-container">
                     <button onClick={() => joinEvent(event.event_id)}>Join Event</button>
                     <button onClick={() => leaveEvent(event.event_id)}>Leave Event</button>
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
