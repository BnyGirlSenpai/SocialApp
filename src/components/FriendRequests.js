import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend, updateDataInDb }  from '../apis/UserDataApi';
import Button from '@mui/material/Button';
import '../styles/friendrequest.css';

const FriendRequests= ({ }) => {
    const { user } = UserAuth();
    const [userData, setUserData] = useState([]);
  
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (user) {
                    const userDataResponse = await getDataFromBackend(`http://localhost:3001/api/users/friendrequests/${user.uid}`);
                    console.log("Loaded friendrequest data from server:", userDataResponse);
                    setUserData(userDataResponse); 
                }  
            } catch (error) {
                console.error("Error fetching friendrequest data:", error);
            }
        };

        fetchUserData();
    }, [user]); 

    const acceptFriendRequest = async (targetUserUid) => {
        let updateData = {
            status: 'accepted',
            uid_transmitter: targetUserUid,
            uid_receiver: user.uid
        };
        await updateDataInDb(updateData,`http://localhost:3001/api/users/update/friendrequests`);
        setUserData(prevData => prevData.filter(request => request.uid !== targetUserUid));
    };
    
    const rejectFriendRequest = async (targetUserUid) => {
        let updateData = {
            status: 'declined',
            uid_transmitter: targetUserUid,
            uid_receiver: user.uid
        };
        await updateDataInDb(updateData,`http://localhost:3001/api/users/update/friendrequests`);
        setUserData(prevData => prevData.filter(request => request.uid !== targetUserUid));
    };

    return (
        <form className="notifications-form">
        <div className="container">
            <div className="friend-list" id="friend-requests">
                <div className="row">
                    {userData.map((user, index) => (
                        <div className="col-md-4 col-sm-6" key={index}>
                            <div className="friend-card">
                                <div className="card-info">
                                    <div className="friend-info">   
                                        <h5><a href={`ProfilePage/${user.uid}`} className="profile-link">{user.username}</a> wants to be your friend</h5> 
                                        <img src={user.photo_url} alt={user.username} />
                                        <Button variant="contained" className="btn btn-primary pull-right" onClick={() => rejectFriendRequest(user.uid)}>Reject</Button>
                                        <Button variant="contained" className="btn btn-primary pull-right" onClick={() => acceptFriendRequest(user.uid)}>Accept</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </form>
    );
};

export default FriendRequests;
