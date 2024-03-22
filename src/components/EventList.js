import React, { useState, useEffect } from 'react';
import '../styles/eventpage.css'; 
import { UserAuth } from '../context/AuthContext';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const { user } = UserAuth(); 

    useEffect(() => {
        fetch('http://localhost:3001/api/events')
            .then(response => response.json())
            .then(data => setEvents(data._embedded.events)) 
            .catch(error => console.error('Error fetching Events:', error));
    }, []);

    return (
      <div>
        <div class="event-container">
          <div class="column">
            <h2>Next Events</h2>
            <ul class="events" id="next-events">
          
            </ul>
          </div>
          <div class="column">
            <h2>Last Events</h2>
            <ul class="events" id="last-events">

            </ul>
          </div>
          <div class="column">
            <h2>My Events</h2>
            <a href="/EventFormpage"><button class="add-event-button">Add Own Event</button></a>
            <ul class="events" id="manage-events">
              
            </ul>
          </div>
        </div>
    </div>
    );
};

export default EventList;