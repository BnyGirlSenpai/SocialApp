import React, { useState, useEffect, useRef } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';
import FriendDropDown from './FriendDropDown';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import ItemList from '../components/ItemList';
import '../styles/eventpage.css'; 

const OwnEventList = () => {
  const { user } = UserAuth(); 
  const [ownEvents, setOwnEvents] = useState([]);
  const [friendDropDownVisible, setFriendDropDownVisible] = useState({}); // New state for dropdown visibility
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const ownEventData = await getDataFromBackend(`http://localhost:3001/api/events/${user.uid}?page=${page}`);
          console.log("Loaded own Event Data from server:", ownEventData);

          if (ownEventData.events && ownEventData.events.length > 0) {
            setOwnEvents(prevEvents => [...prevEvents, ...ownEventData.events]);
            setHasMore(ownEventData.hasMore);
          } else {
            setHasMore(false);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        setLoading(false);
      }
    };

    fetchEventData();
  }, [user, page]); 

  useEffect(() => {
    if (loading) return;

    const handleObserver = (entities) => {
      const target = entities[0];
      if (target.isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    };

    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    };

    observer.current = new IntersectionObserver(handleObserver, options);
    const target = document.querySelector('#load-more');
    if (target) {
      observer.current.observe(target);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore]);

  const hideFriendDropDown = async (eventId) => {
    try {
      if (user) {
        const ownEventData = await getDataFromBackend(`http://localhost:3001/api/events/${user.uid}?page=${page}&limit=10`);
        setOwnEvents(ownEventData ? ownEventData.events : []);
        setFriendDropDownVisible(prevState => ({ ...prevState, [eventId]: false }));  
      }
    } catch (error) {
      console.error("Error fetching own event data:", error);
    }
  };

  const handleInviteClick = (eventId) => {
    setFriendDropDownVisible(prevState => ({ 
      ...prevState, 
      [eventId]: !prevState[eventId] 
    }));
  };

  if (loading && page === 1) { 
    return <p>Loading...</p>; 
  }

  return (
    <div>
      <div className="event-container">
        <div className="column">
          <h2>My Events</h2>
          <a href="/EventFormpage"><button className="add-event-button">Add Own Event</button></a>
          {ownEvents.length > 0 ? (
            <ul className="events" id="manage-events">
              {ownEvents.map((event, index) => (
                <li key={index}>
                  <div className="event-card">
                    <div className="card-info">
                      <div className="event-info">                                
                        <h5><a href={`/EventPage/EventDetailPage/${event.event_id}`} className="event-link">{event.event_name}</a></h5> 
                        <p>Date: {formatLocalDateTime(event.event_datetime).slice(0,10)}</p>
                        <p>Time: {formatLocalDateTime(event.event_datetime).slice(11,17)}</p>
                        <p>Location: {event.location}</p>
                        <p>Description: {event.description}</p>
                        <p>Max Guests: {event.max_guests_count}</p>
                        <p>Current Guests: {event.current_guests_count}</p>
                        <p>Invited: {event.invited_guests_count}</p>
                        <p>Status: {event.event_status}</p>
                        <p>Type: {event.event_type}</p>
                        <p>Image: {event.image_url}</p>
                      </div>
                      <ItemList event_id={event.event_id} />
                    </div>
                  </div>
                  <div className="button-container">                   
                    <a href={`/EditEventFormPage/${event.event_id}`}><button>Edit Event</button></a>                   
                    <button 
                      onClick={() => handleInviteClick(event.event_id)} // Update the click handler
                      disabled={event.current_guests_count >= event.max_guests_count}
                      style={{
                        backgroundColor: event.current_guests_count >= event.max_guests_count ? '#ccc' : '', 
                        color: event.current_guests_count >= event.max_guests_count ? '#666' : '', 
                        cursor: event.current_guests_count >= event.max_guests_count ? 'not-allowed' : 'pointer', 
                        border: '1px solid #ddd', 
                        padding: '10px', 
                      }}
                    >
                      Invite Friends
                    </button>
                    <a href={`/EditItemListFormPage/${event.event_id}`}><button>Edit Item List</button></a> 
                  </div>
                  {friendDropDownVisible[event.event_id] && <FriendDropDown event_id={event.event_id} onInvite={() => hideFriendDropDown(event.event_id)} />}
                </li>
              ))}
            </ul>
          ) : (
            <p>No events found!</p>
          )}
        </div>
      </div>
      {hasMore && <div id="load-more" style={{ height: '1px' }}></div>} {/* The target for IntersectionObserver */}
    </div>
  );
};

export default OwnEventList;
