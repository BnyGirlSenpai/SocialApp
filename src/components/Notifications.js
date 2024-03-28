import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend, updateDataInDb }  from '../apis/UserDataApi';

const Notifications = () => {
    const { user } = UserAuth();
    const [userData, setUserData] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
          try {
              if (user) {
                  const data = await getDataFromBackend(`http://localhost:3001/api/users/friendrequests/${user.uid}`);
                  console.log("Loaded data from server:", data);
                  setUserData(data); 
              }  
          } catch (error) {
              console.error("Error fetching data:", error);
          }
      };
      fetchData();
    }, [user]);

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
//----------------------------------Event Handling---------------------------------------------------//
/*
    const acceptEventRequest = async (targetEventId) => {
        let updateData = {
            status: 'accepted',
            event_id: targetEventId,
            uid_receiver: user.uid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/event/event/invites`)
    };
    
    const rejectEventRequest = async (targetEventId) => {
        let updateData = {
            status: 'declined',
            uid_transmitter: targetUserUid,
            uid_receiver: user.uid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/event/invites`)
    };
*/
    
    return (
    <form>
        <div className="container">
            <h2>Pending Friend Requests</h2>
            <div className="friend-list">
                <div className="row">
                    {userData.map((user, index) => (
                        <div className="col-md-4 col-sm-6" key={index}>
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
                    ))}
                </div>
            </div>
        </div>
    </form>
    );
};

export default Notifications;

/*
<h2>Pending Event Requests</h2>
<div className="friend-list">
    <div className="row">
        {eventData.map((event, index) => (
            <div className="col-md-4 col-sm-6" key={index}>
                <div className="friend-card">
                    <div className="card-info">
                        <div className="friend-info">                                
                            <h5><a href="ProfilePage" className="profile-link">{event.eventname}</a></h5> 
                            <button className="btn btn-primary pull-right" onClick={() => rejectEventRequest(event.event_id)}>Reject</button>
                            <button className="btn btn-primary pull-right" onClick={() => acceptEventRequest(event.event_id)}>Accept</button>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
</div>
*/ 