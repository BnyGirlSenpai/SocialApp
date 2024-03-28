import React from 'react';
import { updateDataInDb } from '../apis/UserDataApi';

const EventRequests= ({ user }) => {

    const acceptEventRequest = async (targetUserUid) => {
        let updateData = {
            status: 'accepted',
            uid_transmitter: targetUserUid,
            uid_receiver: user.uid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/event/event/invites`)
    };
    
    const rejectEventRequest = async (targetUserUid) => {
        let updateData = {
            status: 'declined',
            uid_transmitter: targetUserUid,
            uid_receiver: user.uid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/event/invites`)
    };

    return (
        <div className="col-md-4 col-sm-6">
            <div className="friend-card">
                <div className="card-info">
                    <div className="friend-info">                                
                        <h5><a href="ProfilePage" className="profile-link">{user.username}</a></h5> 
                        <img src={user.photoUrl} alt={user.username} />
                        <button className="btn btn-primary pull-right" onClick={() => acceptEventRequest(user.uid)}>Reject</button>
                        <button className="btn btn-primary pull-right" onClick={() => rejectEventRequest(user.uid)}>Accept</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventRequests;