import React, { useState, useEffect } from 'react';
import '../styles/eventpage.css'; 
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';
import FriendDropDown from './FriendDropDown';


const EventList = () => {
  const { user  } = UserAuth(); 
   console.log("User from context:", user); // Log the user value here
  const [ownEvents, setOwnEvents] = useState([]);
  const [showFriendDropDown, setShowFriendDropDown] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null); 
  const [joinedEvents, setJoinedEvents] = useState([]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const ownEventData = await getDataFromBackend(`http://localhost:3001/api/events/${user.uid}`);
          const joinedEventData = await getDataFromBackend(`http://localhost:3001/api/events/joined/${user.uid}`);

          console.log("Loaded own Event Data from server:", ownEventData);
          console.log("Loaded joined Event Data from server:", joinedEventData);

          setOwnEvents(ownEventData ? [ownEventData] : []);
          setJoinedEvents(joinedEventData ? [joinedEventData] : []);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEventData();
  }, [user]); 

  function leaveEvent(eventId) {
    console.log("Left event with ID:", eventId);

  }

  function hideFriendDropDown() {
    setShowFriendDropDown(false);
  }

  function editEvent(eventId) {
    // Redirect to the event editing page with the event ID
    console.log("Edit event with ID:", eventId);
  }

  return (
    <div>
      <div className="event-container">

        <div className="column">
          <h2>Next Events</h2>
          {joinedEvents[0] && joinedEvents.length > 0 ? (
          <ul className="events" id="next-events">
            {joinedEvents[0] && joinedEvents[0].map((event, index) => (
              <li key={index}>
                <div className="event-card">
                  <div className="card-info">
                    <div className="event-info">                                
                      <h5><a href={`/EventPage/DetailView/${event.event_id}`} className="event-link">{event.event_name}</a></h5> 
                      <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                      <p>Time: {event.event_time.substring(0, 5)}</p>
                      <p>Location: {event.location}</p>
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

        <div className="column">
          <h2>Last Events</h2>
          <ul className="events" id="last-events">
            {/* Last events content */}
          </ul>
        </div>

        {/*Load Own Events*/}
        <div className="column">
          <h2>My Events</h2>
          <a href="/EventFormpage"><button className="add-event-button">Add Own Event</button></a>
          {ownEvents && ownEvents.length > 0 ? (
            <ul className="events" id="manage-events">
              {ownEvents[0].map((event, index) => (
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
                        <p>Invited: {event.invited_guests_count}</p>
                      </div>                 
                    </div>
                  </div>
                  <div className="button-container">                   
                      <button onClick={() => editEvent(event.event_id)}>Edit Event</button>
                      <button onClick={() => {
                        setShowFriendDropDown(true);
                        setSelectedEventId(event.event_id);
                      }}>Invite Friends</button>
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
