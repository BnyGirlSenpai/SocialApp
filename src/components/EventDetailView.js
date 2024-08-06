import React, {useState, useEffect } from 'react';
import { getDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { updateDataInDb } from '../apis/UserDataApi';
import FriendDropDown from './FriendDropDown';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import ItemList from '../components/ItemList';
import Map from '../components/Map';
import '../styles/eventDetailView.css';
import '../styles/map.css';

const EventDetailView = () => {
    const { event_id  } = useParams(); 
    const { user } = UserAuth();
    const [eventData, setEventData] = useState([]);
    const [, setOwnEvents] = useState([]);
    const [showFriendDropDown, setShowFriendDropDown] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null); 
    const isOwner = eventData.creator_uid === user.uid;
    const navigate = useNavigate();
    const [redirect, setRedirect] = useState(false);
    const [guestsData, setGuestsData] = useState({ guests: [] });
    const [dateTime, setDateTime] = useState([]);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                if (user) {
                    const eventData = await getDataFromBackend(`http://localhost:3001/api/events/eventDetail/${event_id }`);
                    const guests = await getDataFromBackend(`http://localhost:3001/api/events/guests/${event_id}`);
                    console.log("Loaded Event Data from server:", eventData);
                    console.log("Loaded guests data from server:", guests);
                    setDateTime(formatLocalDateTime(eventData.event_datetime));
                    setEventData(eventData);
                    setGuestsData(guests || { guests: [] });                
                }
            } catch (error) {
                console.error("Error fetching event data:", error);
            }
        };
        fetchEventData();
    }, [user, event_id]);

    useEffect(() => {
        if (redirect) {
            setTimeout(() => window.location.reload(), 1000);    
        }
    }, [redirect,event_id, navigate]);

    const joinPublicEvent = async (targetEventId) => {
        let updateData = {
            event_id: targetEventId,
            uid_guest: user.uid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/join/public/event`)

        setTimeout(() => {
            setRedirect(true);
        }, 1000);
    };

    const leaveEvent = async (eventId) => {
        const updateData = {
          status: 'left',
          event_id: eventId,
          uid_guest: user.uid
        };
    
        try {
          await updateDataInDb(updateData, `http://localhost:3001/api/events/userStatus/update`);
          console.log("Left event with ID:", eventId);  
        } catch (error) {
          console.error('Error leaving event:', error);
        }

        setTimeout(() => {
            setRedirect(true);
        }, 1000);
    };

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

    const guestUids =  guestsData.guests.map(guest => guest.guest_uid) || [];
    const isInvitedOrJoined = guestUids.includes(user.uid);

    useEffect(() => {
        const mapElements = document.querySelectorAll('.map');
        mapElements.forEach(element => {
            element.classList.add('small');
        });
    }, []); 

    return (
    <div className="event-detail-container">
        <div className="event-detail-info">
            <div className='event-text'>
                <h1>{eventData.event_name}</h1>
                <p>Date: {dateTime.slice(0,10)}</p>
                <p>Time: {dateTime.slice(11,17)}</p>
                <p>Location: {eventData.location}</p>
                <p>Description: {eventData.description}</p>
                <p>Max Guests: {eventData.max_guests_count}</p>
                <p>Current Guests: {eventData.current_guests_count}</p>
                <p>Invited: {eventData.invited_guests_count}</p>
                <p>Status: {eventData.event_status}</p>
                <p>Type: {eventData.event_type}</p>
                <p>Image: {eventData.image_url}</p>
            </div>
            <div className="map-detail-view">
                <Map className="small"/>
            </div>
        </div>                
        {isOwner ? (
            <>
                <div className="button-container">                   
                    <a href={`/EditEventFormPage/${eventData.event_id}`}><Button>Edit Event</Button></a>     
                    <Button onClick={() => {
                            setShowFriendDropDown(!showFriendDropDown);
                            setSelectedEventId(eventData.event_id);
                        }}
                        disabled={eventData.current_guests_count >= eventData.max_guests_count}
                        style={{
                            backgroundColor: eventData.current_guests_count >= eventData.max_guests_count ? '#ccc' : '', 
                            color: eventData.current_guests_count >= eventData.max_guests_count ? '#666' : '', 
                            cursor: eventData.current_guests_count >= eventData.max_guests_count ? 'not-allowed' : 'pointer', 
                            border: '1px solid #ddd', 
                            padding: '10px', 
                        }}>
                        Invite Friends
                    </Button>
                    <a href={`/EditItemListFormPage/${eventData.event_id}`}><Button>Edit Item List</Button></a> 
                </div>
                <div className='Itemlist'>
                    <ItemList event_id={eventData.event_id} />
                </div>
                <div className="Guestlist">
                    <h2>Guestlist</h2>
                        <div className="row">    
                        {guestsData.guests.map((guest, index) => (
                            <div className="col-md-4 col-sm-6" key={index}>
                            <div className="guest-card">
                                <div className="card-info">
                                <div className="guest-info">                                
                                    <h5><a href={`/profilepage/${guest.guest_uid}`} className="profile-link">{guest.username}</a></h5> 
                                    <img src={guest.photo_url} alt={guest.username} />
                                </div>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </>
        ) : (
            isInvitedOrJoined ? (
                <>
                    <div className="button-container">         
                        <Button onClick={() => leaveEvent(eventData.event_id)}>Leave Event</Button>
                    </div>
                    <ItemList event_id={eventData.event_id} />
                    <div className="container">
                        <h2>Guestlist</h2>
                        <div className="guest-list">
                            <div className="row">    
                                {guestsData.guests.map((guest, index) => (
                                <div className="col-md-4 col-sm-6" key={index}>
                                    <div className="guest-card">
                                        <div className="card-info">
                                            <div className="guest-info">                                
                                                <h5><a href={`/profilepage/${guest.guest_uid}`} className="profile-link">{guest.username}</a></h5> 
                                                <img src={guest.photo_url} alt={guest.username} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <Button variant="contained" onClick={() => joinPublicEvent(eventData.event_id)}>Join</Button>
            )
        )}
        {showFriendDropDown && <FriendDropDown eventId={selectedEventId} onInvite={hideFriendDropDown} />}       
    </div>
    );
};

export default EventDetailView;

