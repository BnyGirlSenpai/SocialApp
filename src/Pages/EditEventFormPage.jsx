import React from 'react'
import EditEventForm from '../components/EditEventForm'
import Navbar from '../components/Navbar'

function EditEventFormpage() {
  return (
    <div className='Main'>
       <Navbar />
       <EditEventForm/>
    </div>
  )
}

export default EditEventFormpage