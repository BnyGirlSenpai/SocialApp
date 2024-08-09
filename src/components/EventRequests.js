import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend, updateDataInDb }  from '../apis/UserDataApi';
import Button from '@mui/material/Button';
import '../styles/eventrequest.css';

const EventRequests = () => {
    const { user } = UserAuth();
    const [eventData, setEventData] = useState([]);
  
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                if (user) {
                    const eventDataResponse = await getDataFromBackend(`http://localhost:3001/api/events/invited/${user.uid}`);
                    console.log("Loaded event data from server:", eventDataResponse);
                    setEventData(eventDataResponse); 
                }  
            } catch (error) {
                console.error("Error fetching event data:", error);
            }
        };

        fetchEventData();
    }, [user]); 


    const acceptEventRequest = async (targetEventId) => {
        let updateData = {
            status: 'accepted',
            event_id: targetEventId,
            uid_guest: user.uid
        };
        await updateDataInDb(updateData,`http://localhost:3001/api/events/userStatus/update`);
        setEventData(prevData => prevData.filter(event => event.event_id !== targetEventId));
    };
    
    const rejectEventRequest = async (targetEventId) => {
        let updateData = {
            status: 'declined',
            event_id: targetEventId,
            uid_guest: user.uid
        };
        await updateDataInDb(updateData,`http://localhost:3001/api/events/userStatus/update`);
        setEventData(prevData => prevData.filter(event => event.event_id !== targetEventId));
    };

    return (
    <form className="notifications-form">
        <div className="container">
            <div className="event-list" id="event-requests">
                <div className="row">
                    {eventData.map((event, index) => (
                        <div className="col-md-4 col-sm-6" key={index}>
                            <div className="event-card">
                                <div className="card-info">
                                    <div className="event-info">                                
                                    <h5>You are invited to: <a href={`/EventPage/EventDetailPage/${event.event_id}`} className="event-link">{event.event_name}</a></h5> 
                                        <h5>Created by <a href={`/profilepage/${event.creator_uid}`} className="profile-link">{event.creator_username}</a></h5> 
                                        <Button variant="contained" className="btn btn-primary pull-right" onClick={() => rejectEventRequest(event.event_id)}>Reject</Button>
                                        <Button variant="contained" className="btn btn-primary pull-right" onClick={() => acceptEventRequest(event.event_id)}>Accept</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </form>
    );
};

export default EventRequests;
