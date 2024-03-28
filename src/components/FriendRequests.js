import React from 'react';
import { updateDataInDb } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';

const FriendRequests= ({ }) => {
    const { user } = UserAuth();

    const acceptFriendRequest = async (targetUserUid) => {
        let updateData = {
            status: 'accepted',
            uid_transmitter: targetUserUid,
            uid_receiver: user.uid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/users/update/friendrequests`)
    };
    
    const rejectFriendRequest = async (targetUserUid) => {
        let updateData = {
            status: 'declined',
            uid_transmitter: targetUserUid,
            uid_receiver: user.uid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/users/update/friendrequests`)
    };

    return (
        <div className="col-md-4 col-sm-6">
            <div className="friend-card">
                <div className="card-info">
                    <div className="friend-info">                                
                        <h5><a href="ProfilePage" className="profile-link">{user.username}</a></h5> 
                        <img src={user.photoUrl} alt={user.username} />
                        <button className="btn btn-primary pull-right" onClick={() => rejectFriendRequest(user.uid)}>Reject</button>
                        <button className="btn btn-primary pull-right" onClick={() => acceptFriendRequest(user.uid)}>Accept</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendRequests;