import React from 'react'
import EventDetailView from '../components/EventDetailView'
import Navbar from '../components/Navbar'

function EventDetailpage() {
  return (
    <div className='Main'>
       <Navbar />
       <EventDetailView/>
    </div>
  )
}

export default EventDetailpage