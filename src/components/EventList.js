import React, { useState, useEffect } from 'react';
import '../styles/eventlist.css';

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
    <div class="container">
      <div class="row">
          <div class="col-md-8 offset-md-2">
              <div class="event">
                  <div class="img">
                      <img alt="Event Image"src="https://www.prepbootstrap.com/Content/images/template/design/design1.jpg" />
                  </div>
                  <div class="desc">
                      <h3>First Event</h3>
                      <div class="social ">
                         
                      </div>
                      <a href="#website"><span class="fa fa-globe"></span>  Website</a> 
                  </div>
                  <div class="date float-right">
                      <div class="day">15</div>
                      <div class="month">Jul</div>
                  </div>
              </div>
          </div>
      </div>
    </div>
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
