import React from 'react';
import FriendList from '../components/FriendList';
import Navbar from '../components/Navbar';
import UserSearch from '../components/UserSearch';
import AcceptRejectFriendRequest from '../UserInteractions/AcceptDeclineFriendRequest';

function Friendpage() {
  return (
    <div className='Main'>
       <Navbar />
       <FriendList />
       <UserSearch />
       <AcceptRejectFriendRequest />
    </div>
  )
};

export default Friendpage;
