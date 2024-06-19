import React, { useState,useEffect } from 'react';
import '../styles/eventform.css';
import { sendDataToBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import validateInput from '../utils/UserInputValidator';

const EventForm = () => {
  const { user } = UserAuth();
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [description, setDescription] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);

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

  const handleCreateEvent = async () => {
    try {
      if (user) {
        const eventData = {
          eventName: eventName,
          location: location,
          eventDate: eventDate,
          eventTime: eventTime,
          description: description,
          maxGuests: maxGuests,
          uid: user.uid
        };

        if (!eventName || !location || !eventDate || !eventTime || !maxGuests) {
          alert("Please fill in all fields before saving the event.");
          return;
        }
  
        console.log('Data to server:', eventData);
        await sendDataToBackend(eventData, 'http://localhost:3001/api/event/create');
        setIsButtonClicked(true);
        setTimeout(() => {
          setIsButtonClicked(false);
          setRedirect(true);
        }, 1000);
      } else {
        console.log("User not found!");
      }
    } catch (error) {
      console.error('Error creating event:', error);
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

      <div className="mt-5 text-center">
        <button
          className={`btn ${isButtonClicked ? 'btn-success' : 'btn-primary'} profile-button`}
          type="button"
          onClick={handleCreateEvent}>
          {isButtonClicked ? 'Event Created' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
