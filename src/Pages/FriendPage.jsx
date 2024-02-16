import React from 'react';
import FriendList from '../components/FriendList';
import Navbar from '../components/Navbar';

function Friendpage() {
  return (
    <div className='Main'>
       <Navbar />
       <FriendList />
    </div>
  )
};

export default Friendpage;
