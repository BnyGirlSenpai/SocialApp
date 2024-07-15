import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';
import FriendDropDown from './FriendDropDown';
import '../styles/eventpage.css'; 

const EventList = () => {
  const { user  } = UserAuth(); 
  const [ownEvents, setOwnEvents] = useState([]);
  const [showFriendDropDown, setShowFriendDropDown] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null); 

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const ownEventData = await getDataFromBackend(`http://localhost:3001/api/events/${user.uid}`);
          console.log("Loaded own Event Data from server:", ownEventData);
          setOwnEvents(ownEventData ? [ownEventData] : []);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };
    fetchEventData();
  }, [user]); 

  const hideFriendDropDown = async () => {
    try {
      if (user) {
        const ownEventData = await getDataFromBackend(`http://localhost:3001/api/events/${user.uid}`);
        setOwnEvents(ownEventData ? [ownEventData] : []);
        setShowFriendDropDown(false);  
      }
    } catch (error) {
      console.error("Error fetching own event data:", error);
    }
  }

  return (
    <div>
      <div className="event-container">
        <div className="column">
          <h2>My Events</h2>
          <a href="/EventFormpage"><button className="add-event-button">Add Own Event</button></a>
          {ownEvents[0] ? (
            <ul className="events" id="manage-events">
              {ownEvents[0].map((event, index) => (
                <li key={index}>
                  <div className="event-card">
                    <div className="card-info">
                      <div className="event-info">                                
                      <h5><a href={`/EventPage/EventDetailPage/${event.event_id}`} className="event-link">{event.event_name}</a></h5> 
                        <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                        <p>Time: {event.event_time.substring(0, 5)}</p>
                        <p>Location: {event.location}</p>
                        <p>Description: {event.description}</p>
                        <p>Max Guests: {event.max_guests_count}</p>
                        <p>Current Guests: {event.current_guests_count}</p>
                        <p>Invited: {event.invited_guests_count}</p>
                        <p>Visibility: {event.event_visibility}</p>
                      </div>                 
                    </div>
                  </div>
                  <div className="button-container">                   
                    <a href={`/EditEventFormPage/${event.event_id}`}><button>Edit Event</button></a>                   
                    <button 
                      onClick={() => {
                      setShowFriendDropDown(true);
                      setSelectedEventId(event.event_id);
                    }}
                    disabled={event.current_guests_count >= event.max_guests_count}
                    style={{
                      backgroundColor: event.current_guests_count >= event.max_guests_count ? '#ccc' : '', 
                      color: event.current_guests_count >= event.max_guests_count ? '#666' : '', 
                      cursor: event.current_guests_count >= event.max_guests_count ? 'not-allowed' : 'pointer', 
                      border: '1px solid #ddd', 
                      padding: '10px', 
                    }}
                    >Invite Friends</button>
                  </div>
                </li>
              ))}
            </ul>         
          ) : (
            <p>No events found!</p>
          )}
        </div>
      </div>
      {showFriendDropDown && <FriendDropDown eventId={selectedEventId} onInvite={hideFriendDropDown} />}
    </div>
  );
};

export default EventList;
