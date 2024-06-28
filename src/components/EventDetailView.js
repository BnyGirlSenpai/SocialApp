import React, { useEffect } from 'react';
import '../styles/eventDetailView.css';
import { updateDataInDb, getDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const EventDetailView = () => {
    const { event_id  } = useParams(); 
    const { user } = UserAuth();

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                if (user) {
                    const eventData = await getDataFromBackend(`http://localhost:3001/api/events/eventDetail/${event_id }`);
                    console.log("Loaded Event Data from server:", eventData);
                }
            } catch (error) {
                console.error("Error fetching event data:", error);
            }
        };
        fetchEventData();
    }, [user, event_id ]);

    return (
        <div>
            {/* Render event details here */}
        </div>
    );
};

export default EventDetailView;
