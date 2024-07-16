import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { sendDataToBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/eventform.css';

const EventForm = () => {
  const { user } = UserAuth();
  const navigate = useNavigate();
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const validationSchema = Yup.object().shape({
    eventName: Yup.string().required('Event name is required'),
    location: Yup.string().required('Location is required'),
    eventDate: Yup.date()
      .required('Event date is required')
      .test('is-future-date', 'Event date cannot be in the past', (value) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        return value && new Date(value).getTime() >= currentDate.getTime();
      }),
    eventTime: Yup.string().required('Event time is required').test(
      'is-future-time',
      'Event time must be in the future for today\'s date',
      function (value) {
        const { eventDate } = this.parent;
        if (eventDate) {
          const selectedDate = new Date(eventDate);
          const selectedTime = value.split(':');
          selectedDate.setHours(selectedTime[0], selectedTime[1]);

          const currentDate = new Date();
          if (selectedDate.toDateString() === currentDate.toDateString()) {
            return selectedDate.getTime() > currentDate.getTime();
          }
          return true;
        }
        return true;
      }
    ),
    description: Yup.string().required('Description is required'),
    maxGuests: Yup.number()
      .required('Max guests is required')
      .min(0, 'Min value is 0')
      .max(69, 'Max value is 69'),
  });

  const formik = useFormik({
    initialValues: {
      eventName: '',
      location: '',
      eventDate: '',
      eventTime: '',
      description: '',
      maxGuests: '',
      eventVisibility: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        if (user) {

          const localDateTime = new Date(`${values.eventDate}T${values.eventTime}`);
          // Convert to UTC and format as required for MySQL datetime
          const utcDateTime = localDateTime.toISOString().slice(0, 19).replace('T', ' ');

          const eventData = {
            eventName: values.eventName,
            location: values.location,
            eventDateTime: utcDateTime,
            description: values.description,
            maxGuests: values.maxGuests,
            eventVisibility: values.eventVisibility ? 'private' : 'public',
            uid: user.uid,
          };

          console.log('Data to server:', eventData);
          await sendDataToBackend(eventData, 'http://localhost:3001/api/event/create');
          setIsButtonClicked(true);
          setTimeout(() => {
            setIsButtonClicked(false);
            navigate('/EventPage');
          }, 1000);
        } else {
          console.log("User not found!");
        }
      } catch (error) {
        console.error('Error creating event:', error);
      }
    }
  });

  return (
    <form className="event-form" onSubmit={formik.handleSubmit}>

      <label htmlFor="eventName">Event Name</label>
      <input
        type="text"
        id="eventName"
        name="eventName"
        placeholder="Enter Event Name"
        value={formik.values.eventName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.eventName && formik.errors.eventName ? (
        <div className="error">{formik.errors.eventName}</div>
      ) : null}

      <label htmlFor="location">Location</label>
      <input
        type="text"
        id="location"
        name="location"
        placeholder="Enter Location"
        value={formik.values.location}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.location && formik.errors.location ? (
        <div className="error">{formik.errors.location}</div>
      ) : null}

      <label htmlFor="eventDate">Event Date</label>
      <input
        type="date"
        id="eventDate"
        name="eventDate"
        placeholder="Select Event Date"
        value={formik.values.eventDate}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.eventDate && formik.errors.eventDate ? (
        <div className="error">{formik.errors.eventDate}</div>
      ) : null}

      <label htmlFor="eventTime">Event Time</label>
      <input
        type="time"
        id="eventTime"
        name="eventTime"
        placeholder="Select Event Time"
        value={formik.values.eventTime}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.eventTime && formik.errors.eventTime ? (
        <div className="error">{formik.errors.eventTime}</div>
      ) : null}

      <label htmlFor="description">Event Description</label>
      <textarea
        id="description"
        name="description"
        placeholder="Enter Event Description"
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      ></textarea>
      {formik.touched.description && formik.errors.description ? (
        <div className="error">{formik.errors.description}</div>
      ) : null}

      <label htmlFor="maxGuests">Max Guests</label>
      <input
        type="number"
        id="maxGuests"
        name="maxGuests"
        placeholder="Enter Max Guests"
        value={formik.values.maxGuests}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.maxGuests && formik.errors.maxGuests ? (
        <div className="error">{formik.errors.maxGuests}</div>
      ) : null}

      <div className="mt-3">
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={() => formik.setFieldValue('eventVisibility', !formik.values.eventVisibility)}
        >
          {formik.values.eventVisibility ? 'Private' : 'Public'}
        </button>
      </div>

      <div className="mt-5 text-center">
        <button
          className={`btn ${isButtonClicked ? 'btn-success' : 'btn-primary'} profile-button`}
          type="submit"
        >
          {isButtonClicked ? 'Event Created' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
