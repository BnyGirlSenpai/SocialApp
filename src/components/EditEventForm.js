import React, { useState, useEffect } from 'react';
import '../styles/eventform.css';
import { useParams } from 'react-router-dom'; 
import { updateDataInDb,getDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';

const EditEventForm = () => {
  const { user } = UserAuth();
  const { event_id } = useParams();  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [description, setDescription] = useState('');
  const [maxGuests, setMaxGuests] = useState('');

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
                    console.log("Loaded data from server:", data);
                }  
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
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
    };

    const handleSaveEvent = async () => { 
        try {
            if (user) {
                const updatedData = [eventName, location, eventDate, eventTime, description, maxGuests, event_id];
                console.log('Data to server:', updatedData);
                await updateDataInDb(JSON.stringify(updatedData), 'http://localhost:3001/api/events/edit/update'); 
                setIsButtonClicked(true);
                setTimeout(() => {
                    setIsButtonClicked(false);
                }, 1000);
            } else {
                console.log("Event not found!");
            }
        } catch (error) {
            console.error('Error updating Event data:', error);
        }
    };

  return (
    <form className="event-form">
      <label htmlFor="eventName">Event Name</label>
      <input required type="text" id="eventName" name="eventName" placeholder="Enter Event Name" value={eventName} onChange={handleInputChange} />

      <label htmlFor="location">Location</label>
      <input required type="text" id="location" name="location" placeholder="Enter Location" value={location} onChange={handleInputChange} />

      <label htmlFor="eventDate">Event Date</label>
      <input required type="date" id="eventDate" name="eventDate" placeholder="Select Event Date" value={eventDate} onChange={handleInputChange} />

      <label htmlFor="eventTime">Event Time</label>
      <input required type="time" id="eventTime" name="eventTime" placeholder="Select Event Time" value={eventTime} onChange={handleInputChange} />

      <label htmlFor="description">Event Description</label>
      <textarea id="description" name="description" placeholder="Enter Event Description" value={description} onChange={handleInputChange}></textarea>

      <label htmlFor="maxGuests">Max Guests</label>
      <input required type="number" id="maxGuests" name="maxGuests" placeholder="Enter Max Guests" value={maxGuests} onChange={handleInputChange} />

      <div className="mt-5 text-center">
        <button
          className={`btn ${isButtonClicked ? 'btn-success' : 'btn-primary'} profile-button`}
          type="button"
          onClick={handleSaveEvent}>
          {isButtonClicked ? 'Event updated' : 'Update Event'}
        </button>
      </div>
    </form>
  );
};

export default EditEventForm;
