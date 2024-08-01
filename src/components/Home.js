import React, { useState, useEffect, useRef } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import Button from '@mui/material/Button';
import '../styles/eventpage.css';

const Home = () => {
  const { user } = UserAuth();
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (user) {
          const publicEventsData = await getDataFromBackend(`http://localhost:3001/api/public/events?page=${page}`);
          console.log('Fetched data:', publicEventsData);
          
          if (publicEventsData.events && publicEventsData.events.length > 0) {
            setPublicEvents(prevEvents => [...prevEvents, ...publicEventsData.events]);
            setHasMore(publicEventsData.hasMore);
          } else {
            setHasMore(false);
          }
          setLoading(false); 
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        setLoading(false); 
      }
    };

    fetchEventData();
  }, [user, page]);

  useEffect(() => {
    if (loading) return;

    const handleObserver = (entities) => {
      console.log('IntersectionObserver triggered:', entities);
      const target = entities[0];
      if (target.isIntersecting && hasMore) {
        console.log('Loading more events...');
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
    } else {
      console.warn('Target element not found');
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore]);

  if (loading && page === 1) {
    return <p>Loading...</p>; 
  }

  console.log('Rendering events:', publicEvents);
  console.log('Loading:', loading);
  console.log('Has more:', hasMore);

  return (
    <div>
      <div className="event-container">
        <div className="column">
          <h2>Public Events</h2>
          {publicEvents.length > 0 ? (
            <ul className="events" id="next-events">
              {publicEvents.map((event, index) => (
                <li key={index}>
                  <div className="event-card">
                    <div className="card-info">
                      <div className="event-info">
                        <h5><a href={`/EventPage/EventDetailPage/${event.event_id}`} className="event-link">{event.event_name}</a></h5>                       
                        <p>Creator: <a href={`/profilepage/${event.creator_uid}`} className="event-link">{event.creator_username}</a></p>
                        <p>Date: {formatLocalDateTime(event.event_datetime).slice(0,10)}</p>
                        <p>Time: {formatLocalDateTime(event.event_datetime).slice(11,17)}</p>
                        <p>Location: {event.location}</p>
                        <p>Current Guests: {event.current_guests_count} / {event.max_guests_count} </p>
                        <p>Info: {event.description}</p>
                        <p>Type: {event.event_type}</p>
                        <p>Image: {event.image_url}</p>
                      </div>
                      <a href={`/EventPage/EventDetailPage/${event.event_id}`}>
                        <Button variant="contained">Details</Button>
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No events found.</p>
          )}
        </div>
      </div>
      {loading && <p>Loading more events...</p>}
      {hasMore && <div id="load-more" style={{ height: '1px' }}></div>}
    </div>
  );
}

export default Home;
