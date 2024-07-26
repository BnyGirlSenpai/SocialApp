import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend , updateDataInDb } from '../apis/UserDataApi';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import '../styles/eventpage.css'; 

const EventList = () => {
  const { user  } = UserAuth(); 
  const [joinedEvents, setJoinedEvents] = useState([]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const joinedEventData = await getDataFromBackend(`http://localhost:3001/api/events/joined/${user.uid}`);
          console.log("Loaded joined Event Data from server:", joinedEventData);
  
          if (joinedEventData && joinedEventData.length > 0) {

            setJoinedEvents([joinedEventData]);
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
  
  const leaveEvent = async (eventId) => {
    let updateData = {
      status: 'left',
      event_id: eventId,
      uid_guest: user.uid
    };

    try {
      await updateDataInDb(updateData, `http://localhost:3001/api/events/update`);
      console.log("Left event with ID:", eventId);
      
      setJoinedEvents((prevEvents) => [prevEvents[0].filter(event => event.event_id !== eventId)]);
    } catch (error) {
      console.error('Error leaving event:', error);
    }
  };

  return (
    <div>
      <div className="event-container">
        <div className="column">
          <h2>Next Events</h2>
          {joinedEvents[0] ? (
          <ul className="events" id="next-events">
            {joinedEvents[0] && joinedEvents[0].map((event, index) => (
              <li key={index}>
                <div className="event-card">
                  <div className="card-info">
                    <div className="event-info">                                
                      <h5><a href={`/EventPage/EventDetailPage/${event.event_id}`} className="event-link">{event.event_name}</a></h5> 
                      <p>Date: {formatLocalDateTime(event.event_datetime).slice(0,10)}</p>
                      <p>Time: {formatLocalDateTime(event.event_datetime).slice(11,17)}</p>
                      <p>Location: {event.location}</p>
                      <p>Status: {event.event_status}</p>
                    </div>                 
                  </div>
                </div>
                <div className="button-container">
                  <button onClick={() => leaveEvent(event.event_id)}>Leave Event</button>
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
