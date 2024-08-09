import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; 
import { updateDataInDb,getDataFromBackend,deleteDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import { Button } from '@mui/material';
import '../styles/eventform.css';

const EditEventForm = () => {
    const { user } = UserAuth();
    const { event_id } = useParams(); 
    const [selectedFile, setSelectedFile] = useState(null);
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
      eventType: Yup.string().required('Event type is required'),
    });

    const formik = useFormik({
        initialValues: {
        eventName: '',
        location: '',
        eventDate: '',
        eventTime: '',
        description: '',
        maxGuests: '',
        eventType: '',
        eventStatusPublic: false,
        eventStatusOpen: false
        },
        validationSchema: validationSchema,
        enableReinitialize: true, 
        onSubmit: async values => {
            console.log('Submitting:', values);
            try {
                if (user) {
                    const localDateTime = new Date(`${values.eventDate}T${values.eventTime}`);
                    const utcDateTime = localDateTime.toISOString().slice(0, 19).replace('T', ' ');
                    const eventStatus = [
                        values.eventStatusPublic,
                        values.eventStatusOpen
                    ].filter(status => status).join(',');
                    const updatedData = [
                        values.eventName,
                        values.location,
                        utcDateTime, 
                        values.description,
                        values.maxGuests,
                        values.eventType,
                        selectedFile ? selectedFile.name : '',
                        eventStatus,
                        user.uid,
                        event_id
                    ];
            
                    console.log('Data to server:', updatedData);
                    await updateDataInDb(JSON.stringify(updatedData),'http://localhost:3001/api/events/edit/update'); 
                    setTimeout(() => navigate('/OwnEventsPage'), 1000);
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
              await deleteDataFromBackend(`http://localhost:3001/api/events/edit/delete/${event_id}`); 
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
                      eventType: data[0]?.event_type || '',
                      eventImage: data[0]?.image_url || '',
                      eventStatusPublic:  (data[0]?.event_status ||'').split(',')[0],
                      eventStatusOpen:  (data[0]?.event_status || '').split(',')[1]
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
            navigate('/OwnEventsPage');
        }
    }, [redirect, navigate]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

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

            <label htmlFor="eventType">Event Type</label>
            <select
            id="eventType"
            name="eventType"
            value={formik.values.eventType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            >
            <option value="">Select Event Type</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
            <option value="meetup">Meetup</option>
            {/* Add more event types as needed */}
            </select>
            {formik.touched.eventType && formik.errors.eventType ? (
            <div className="error">{formik.errors.eventType}</div>
            ) : null}

            <label htmlFor="eventImage">Event Image</label>
            <div
            className="image-upload"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            >
            <input
                type="file"
                id="eventImage"
                name="eventImage"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <Button variant='contained'
                type="button"
                onClick={() => document.getElementById('eventImage').click()}
            >
                {selectedFile ? selectedFile.name : 'Choose Event Image'}
            </Button>
            <p>Drag & drop an image here or click to select</p>
      </div>

      <div className="mt-3">
            <Button variant='contained'
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => {
                    formik.setFieldValue(
                        'eventStatusPublic',
                        formik.values.eventStatusPublic === 'public' ? 'private' : 'public'
                    );
                }}
            >
                {formik.values.eventStatusPublic === 'public' ? 'Make Private' : 'Make Public'}
            </Button>
      </div>

       <div className="mt-3">
            <Button variant='contained'
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                  formik.setFieldValue(
                      'eventStatusOpen',
                      formik.values.eventStatusOpen === 'open' ? 'closed' : 'open'
                  );
                  console.log(formik.values.eventStatusOpen);

              }}
          >
              {formik.values.eventStatusOpen === 'open' ? 'Close Event' : 'Open Event'}
            </Button>
      </div>

      <div className="mt-5 text-center">
            <Button variant='contained' type="submit" className="save-event button">
              Update Event
            </Button>

            <Button variant='contained'type="button" className="delete-event button" onClick={handleDeleteEvent}>
                Delete Event
            </Button>
      </div>
  </form>
  );
};

export default EditEventForm;
