import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import { updateDataInDb,getDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import validateInput from '../utils/UserInputValidator';
import '../styles/eventform.css';

const EditEventForm = () => {
  const { user } = UserAuth();
  const { event_id } = useParams(); 
  const [isSaveButtonClicked, setIsSaveButtonClicked] = useState(false);
  const [isDeleteButtonClicked, setIsDeleteButtonClicked] = useState(false);
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [description, setDescription] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const [eventStatus, setEventStatus] = useState('public'); 
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const data = await getDataFromBackend(`http://localhost:3001/api/events/edit/${event_id}`);
                    setEventName(data[0]?.event_name || '');
                    setLocation(data[0]?.location || '');
                    const utcDate = new Date(data[0]?.event_date);
                    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
                    setEventDate(localDate.toISOString().split('T')[0]);     
                    setEventTime(data[0]?.event_time || '');
                    setDescription(data[0]?.description || '');
                    setMaxGuests(data[0]?.max_guests_count  || '');
                    setEventStatus(data[0]?.event_status || 'public'); 
                    console.log("Loaded data from server:", data);
                }  
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user,event_id]);

    useEffect(() => {
        if (redirect) {
            navigate('/EventPage');
        }
    }, [redirect, navigate]);

    const handleInputChange = (e) => {
        let { name, value } = e.target; 
        let isValid = false;
    
        switch (name) {
          case 'eventName':
            isValid = validateInput(value, 'text');
            break;
          case 'location':
            isValid = validateInput(value, 'text');
            break;
          case 'description':
            isValid = validateInput(value, 'text');
            break;
          case 'eventDate':
            const currentDate = new Date();
            const selectedDate = new Date(value);
            isValid = validateInput(value, 'date') && selectedDate >= currentDate.setHours(0, 0, 0, 0);   
            break;
            case 'eventTime':
            const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
            isValid = validateInput(value, 'time') && value >= currentTime;  
            break;
            case 'maxGuests':
              const numericValue = parseInt(value, 10);
              isValid = !isNaN(numericValue) && numericValue <= 69 && numericValue >=0;
              value = numericValue > 69 ? 69 : numericValue;
              break;
            default:
              break;
        }
    
        if (isValid) {
          switch (name) {
            case 'eventName':
              setEventName(value);
              break;
            case 'location':
              setLocation(value);
              break;
            case 'eventDate':
              setEventDate(value);
              break;
            case 'eventTime':
              setEventTime(value);
              break;
            case 'description':
              setDescription(value);
              break;
            case 'maxGuests':
              setMaxGuests(value);
              break;
            default:
              break;
          }
        } else {
          alert(`Invalid ${name} input:`, value);
        }
      };

    const handleSaveEvent = async () => {
        if (!eventName || !location || !eventDate || !eventTime || !maxGuests) {
            alert("Please fill in all fields before saving the event.");
            return;
        }

        try {
            if (user) {
            const updatedData = [eventName, location, eventDate, eventTime, description, maxGuests, eventStatus, event_id];
            console.log('Data to server:', updatedData);
            await updateDataInDb(JSON.stringify(updatedData), 'http://localhost:3001/api/events/edit/update'); 
            setIsSaveButtonClicked(true);
            setTimeout(() => {
                setIsSaveButtonClicked(false);
                setRedirect(true);
            }, 1000);
            } else {
            console.log("Event not found!");
            }
        } catch (error) {
            console.error('Error updating Event data:', error);
        }
    };

    const handleTogglePrivacy = () => {
      setEventStatus(eventStatus === 'public' ? 'private' : 'public'); 
    };
  
    const handleDeleteEvent = async () => { 
        try {
            if (user) {
                const deleteData = [event_id];
                console.log('Data to server:', deleteData);
                await updateDataInDb(JSON.stringify(deleteData), 'http://localhost:3001/api/events/edit/delete'); 
                setIsDeleteButtonClicked(true);
                setTimeout(() => {
                    setIsDeleteButtonClicked(false);
                    setRedirect(true);
                }, 1000);
            } else {
                console.log("Event not found!");
            }
        } catch (error) {
            console.error('Error deleting Event data:', error);
        }
    };  

    return (
    <form className="event-form">
        <label htmlFor="eventName">Event Name</label>
        <input type="text" id="eventName" name="eventName" placeholder="Enter Event Name" value={eventName} onChange={handleInputChange} />

        <label htmlFor="location">Location</label>
        <input type="text" id="location" name="location" placeholder="Enter Location" value={location} onChange={handleInputChange} />

        <label htmlFor="eventDate">Event Date</label>
        <input type="date" id="eventDate" name="eventDate" placeholder="Select Event Date" value={eventDate} onChange={handleInputChange} />

        <label htmlFor="eventTime">Event Time</label>
        <input type="time" id="eventTime" name="eventTime" placeholder="Select Event Time" value={eventTime} onChange={handleInputChange} />

        <label htmlFor="description">Event Description</label>
        <textarea id="description" name="description" placeholder="Enter Event Description" value={description} onChange={handleInputChange}></textarea>

        <label htmlFor="maxGuests">Max Guests</label>
        <input type="number" id="maxGuests" name="maxGuests" placeholder="Enter Max Guests" value={maxGuests} onChange={handleInputChange} />

        <div className="mt-3">
          <button type="button" className="btn btn-sm btn-secondary" onClick={handleTogglePrivacy}>
            {eventStatus === 'public' ? 'Make Private' : 'Make Public'}
          </button>
        </div>

        <div className="mt-5 text-center">
            <button
                className={`save-event button`}
                type="button"
                onClick={handleSaveEvent}>
                {isSaveButtonClicked ? 'Event updated' : 'Update Event'}
            </button>

            <button
                className={`delete-event button`}
                type="button"
                onClick={handleDeleteEvent}>
                {isDeleteButtonClicked ? 'Deleted Event' : 'Delete Event'}
            </button>
        </div>
    </form>
  );
};

export default EditEventForm;
