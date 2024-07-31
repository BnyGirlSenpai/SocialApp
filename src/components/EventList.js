import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend , updateDataInDb } from '../apis/UserDataApi';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import FriendDropDown from './FriendDropDown';
import ItemList from '../components/ItemList';
import '../styles/eventpage.css'; 

const EventList = () => {
  const { user  } = UserAuth(); 
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [showFriendDropDown, setShowFriendDropDown] = useState(false);
  const [creatorUid, setCreatorUid] = useState(null)
  
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const joinedEventData = await getDataFromBackend(`http://localhost:3001/api/events/joined/${user.uid}`);
          console.log("Loaded joined Event Data from server:", joinedEventData);
          const creatorUid = joinedEventData.length > 0 ? joinedEventData[0].creator_uid : null;
          if (joinedEventData && joinedEventData.length > 0) {
            setJoinedEvents([joinedEventData]);
            setCreatorUid(creatorUid);
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
  
  const hideFriendDropDown = async () => {
    try {
      if (user) {
        const joinedEventsData = await getDataFromBackend(`http://localhost:3001/api/events/${user.uid}`);
        setJoinedEvents(joinedEventsData ? [joinedEventsData] : []);
        setShowFriendDropDown(false);  
      }
    } catch (error) {
      console.error("Error fetching own event data:", error);
    }
  }

  const leaveEvent = async (eventId) => {
    let updateData = {
      status: 'left',
      event_id: eventId,
      uid_guest: user.uid
    };

    try {
      await updateDataInDb(updateData, `http://localhost:3001/api/events/userStatus/update`);
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
                    {<ItemList event_id={event.event_id} />}
                  </div>
                </div>
                <div className="button-container">
                  <button onClick={() => leaveEvent(event.event_id)}>Leave Event</button>
                  {event.event_status.includes('open') && (
                  <button onClick={() => {
                      setShowFriendDropDown(!showFriendDropDown);
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
                  )}
                </div>
                {showFriendDropDown && <FriendDropDown eventId={event.event_id} onInvite={hideFriendDropDown} creatorUid={creatorUid} />}
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
