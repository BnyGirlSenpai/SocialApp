import React, {useState, useEffect } from 'react';
import '../styles/eventDetailView.css';
import { getDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const EventDetailView = () => {
    const { event_id  } = useParams(); 
    const { user } = UserAuth();
    const [eventData, setEventData] = useState([]);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                if (user) {
                    const eventData = await getDataFromBackend(`http://localhost:3001/api/events/eventDetail/${event_id }`);
                    console.log("Loaded Event Data from server:", eventData);
                    setEventData(eventData);
                }
            } catch (error) {
                console.error("Error fetching event data:", error);
            }
        };
        fetchEventData();
    }, [user, event_id ]);

    return (
        <div className="event-detail-container">
            <div className="event-detail">
                <h1 className="event-title">{eventData.event_name}</h1>
                <div className="event-date">Date: {new Date(eventData.event_date).toLocaleDateString()}</div>
                <div className="event-time">Time: {eventData.event_time}</div>
                <div className="event-location">Location: {eventData.location}</div>
            </div>
        </div>
    );
};

export default EventDetailView;
