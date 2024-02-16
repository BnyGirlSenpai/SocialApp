import React from 'react';
import Navbar from '../components/Navbar';
import Home from '../components/Home';

function Homepage() {
  return (
    <div className='Main'>
        <Navbar />
        <Home/>
    </div>
  )
};

export default Homepage;