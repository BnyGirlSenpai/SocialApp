import React from 'react';
import EventList from '../components/EventList';
import OwnEventList from '../components/OwnEventList';
import Navbar from '../components/Navbar';

function Eventpage() {
  return (
    <div>
       <Navbar />
       <OwnEventList/>
       <EventList />
    </div>
  )
};

export default Eventpage;
