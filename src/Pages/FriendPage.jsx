import React from 'react';
import FriendList from '../components/FriendList';
import Navbar from '../components/Navbar';
import UserSearch from '../components/UserSearch';


function Friendpage() {
  return (
    <div className='Main'>
       <Navbar />
       <FriendList />
       <UserSearch />
    </div>
  )
};

export default Friendpage;
