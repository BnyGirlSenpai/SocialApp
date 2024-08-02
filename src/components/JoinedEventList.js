import React, { useState, useEffect, useRef } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend, updateDataInDb } from '../apis/UserDataApi';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import FriendDropDown from './FriendDropDown';
import '../styles/eventpage.css'; 

const JoinedEventList = () => {
  const { user } = UserAuth(); 
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [showFriendDropDown, setShowFriendDropDown] = useState(false);
  const [creatorUid, setCreatorUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); 
  const observer = useRef();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const joinedEventData = await getDataFromBackend(`http://localhost:3001/api/events/joined/${user.uid}?page=${page}&limit=10`);
          console.log("Loaded joined Event Data from server:", joinedEventData);
          const creatorUid = joinedEventData.events.length > 0 ? joinedEventData.events[0].creator_uid : null;
          if (joinedEventData.events && joinedEventData.events.length > 0) {
            setJoinedEvents(prevEvents => [...prevEvents, ...joinedEventData.events]);
            setHasMore(joinedEventData.hasMore);
            setCreatorUid(creatorUid);
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

  const hideFriendDropDown = async () => {
    try {
      if (user) {
        const joinedEventsData = await getDataFromBackend(`http://localhost:3001/api/events/joined/${user.uid}?page=${page}&limit=10`);
        setJoinedEvents(joinedEventsData ? joinedEventsData.events : []);
        setShowFriendDropDown(false);  
      }
    } catch (error) {
      console.error("Error fetching joined event data:", error);
    }
  }

  const leaveEvent = async (eventId) => {
    const updateData = {
      status: 'left',
      event_id: eventId,
      uid_guest: user.uid
    };

    try {
      await updateDataInDb(updateData, `http://localhost:3001/api/events/userStatus/update`);
      console.log("Left event with ID:", eventId);
      
      setJoinedEvents(prevEvents => prevEvents.filter(event => event.event_id !== eventId));
    } catch (error) {
      console.error('Error leaving event:', error);
    }
  };

  if (loading && page === 1) { 
    return <p>Loading...</p>; 
  }

  return (
    <div>
      <div className="event-container">
        <div className="column">
          <h2>Joined Events</h2>
          {joinedEvents.length > 0 ? (
            <ul className="events" id="next-events">
              {joinedEvents.map((event, index) => (
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
                    {event.event_status.includes('open') && (
                      <button 
                        onClick={() => setShowFriendDropDown(!showFriendDropDown)}
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
                    )}
                  </div>
                  {showFriendDropDown && <FriendDropDown event_id={event.event_id} onInvite={hideFriendDropDown} creatorUid={creatorUid} />}
                </li>
              ))}
            </ul>
          ) : (
            <p>No events found.</p>
          )}
        </div>
      </div>
      {hasMore && <div id="load-more" style={{ height: '1px' }}></div>} {}
    </div>
  );
};

export default JoinedEventList;
