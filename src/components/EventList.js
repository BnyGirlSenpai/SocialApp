import React, { useState, useEffect } from 'react';

const EventList = () => {
  //const [events, setEvents] = useState([]);

 /* useEffect(() => {
    // Fetch data from the API endpoint
    fetch('http://localhost:3001/api/events')
      .then(response => response.json())
      .then(data => setEvents(data))
      .catch(error => console.error('Error fetching Events:', error));
  }, []);*/

  return (
    <div>EventList</div>
    );
    /*<div>
      <h1>Upcoming Event for Bootshaus Cologne</h1>
     <ul>
        {events.map(event => (
          <li key={event.id}>{event.eventname} Date/Time: {event.eventdate}</li>
        ))}
      </ul>
    </div>*/
};

export default EventList;
