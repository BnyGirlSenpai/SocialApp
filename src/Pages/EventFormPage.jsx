import React from 'react'
import EventForm from '../components/EventForm'
import Navbar from '../components/Navbar'

function EventFormpage() {
  return (
    <div className='Main'>
       <Navbar />
       <EventForm/>
    </div>
  )
}

export default EventFormpage