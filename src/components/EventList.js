import React, { useState, useEffect } from 'react';
import '../styles/eventlist.css'; // Assuming you have styles for this

const EventList = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/events')
            .then(response => response.json())
            .then(data => setEvents(data._embedded.events)) // Extract the events array
            .catch(error => console.error('Error fetching Events:', error));
    }, []);

    return (
        <div>
            <h1>Upcoming Events</h1>
            <ul>
                {events.map(event => ( 
                    <li key={event.id}>
                      <article class="eventlist-event">                 
                        <div class="eventlist-details">
                          <h3>{event.name}</h3>
                          <div class="eventlist-date float-right">
                  
                          </div>                 
                        </div>
                      </article> 
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventList;