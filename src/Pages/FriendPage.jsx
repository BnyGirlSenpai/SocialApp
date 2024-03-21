import React from 'react';
import FriendList from '../components/FriendList';
import Navbar from '../components/Navbar';
import UserSearch from '../components/UserSearch';

function Friendpage() {
  return (
    <div className='Main'>
       <Navbar />
       <UserSearch />
       <FriendList />
    </div>
  )
};

export default Friendpage;
