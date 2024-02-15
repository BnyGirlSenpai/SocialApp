import React from 'react';
import EventList from '../components/EventList';
import Navbar from '../components/Navbar';

function Eventpage() {
  return (
    <div className='Main'>
       <Navbar />
       <EventList />
    </div>
  )
};

export default Eventpage;
