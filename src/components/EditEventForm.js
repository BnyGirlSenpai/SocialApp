import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; 
import { updateDataInDb,getDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import '../styles/eventform.css';

const EditEventForm = () => {
  const { user } = UserAuth();
  const { event_id } = useParams(); 
  const [, setIsDeleteButtonClicked] = useState(false);
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);

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
      eventVisibility: 'public',
  },
    validationSchema: validationSchema,
    enableReinitialize: true, 
    onSubmit: async values => {
        console.log('Submitting:', values);
        try {
            if (user) {
                const localDateTime = new Date(`${values.eventDate}T${values.eventTime}`);
                // Convert to UTC and format as required for MySQL datetime
                const utcDateTime = localDateTime.toISOString().slice(0, 19).replace('T', ' ');

                const updatedData = [
                    values.eventName,
                    values.location,
                    utcDateTime, 
                    values.description,
                    values.maxGuests,
                    values.eventVisibility,
                    event_id
                ];
                console.log('Data to server:', updatedData);
                await updateDataInDb(JSON.stringify(updatedData), 'http://localhost:3001/api/events/edit/update'); 
                setTimeout(() => navigate('/EventPage'), 1000);
            } else {
                console.log("Event not found!");
            }
        } catch (error) {
            console.error('Error updating Event data:', error);
        }
    },
  });

  const formikRef = useRef(formik);

  useEffect(() => {
      formikRef.current = formik;
  }, [formik]);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const data = await getDataFromBackend(`http://localhost:3001/api/events/edit/${event_id}`);
                    formikRef.current.setValues({
                      eventName: data[0]?.event_name || '',
                      location: data[0]?.location || '',
                      eventDate: formatLocalDateTime(data[0]?.event_datetime || '').split(',')[0].split('.').reverse().join('-'),
                      eventTime: formatLocalDateTime(data[0]?.event_datetime || '').split(',')[1].trim(),
                      description: data[0]?.description || '',
                      maxGuests: data[0]?.max_guests_count || '',
                      eventVisibility: data[0]?.event_visibility || 'public'
                  });
                   
                  console.log("Loaded data from server:", data);
                }  
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user, event_id]);

    useEffect(() => {
        if (redirect) {
            navigate('/EventPage');
        }
    }, [redirect, navigate]);

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
              onClick={() => {
                  formik.setFieldValue(
                      'eventVisibility',
                      formik.values.eventVisibility === 'public' ? 'private' : 'public'
                  );
              }}
          >
              {formik.values.eventVisibility === 'public' ? 'Make Private' : 'Make Public'}
          </button>
      </div>

      <div className="mt-5 text-center">
          <button type="submit" className="save-event button">
              Update Event
          </button>

          <button type="button" className="delete-event button" onClick={handleDeleteEvent}>
              Delete Event
          </button>
      </div>
  </form>
  );
};

export default EditEventForm;
