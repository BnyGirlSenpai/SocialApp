import React from 'react';
import FriendRequests from '../components/FriendRequests';
import EventRequests from '../components/EventRequests';

const Notifications = () => {
    return (
    <div className="container">
        <FriendRequests/>
        <EventRequests/>
        <p>other Notifications coming soon</p>
    </div>
    );
};

export default Notifications;

