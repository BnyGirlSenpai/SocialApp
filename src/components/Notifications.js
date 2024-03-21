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
                  setUserData(data); // Set the fetched data to state
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
<div>
<div className="container">
    <div className="row">
    <div className="col-md-8">
        <div>
        {pendingFriendRequests.length > 0 ? (
            <div>
                <h2>Pending Friend Requests</h2>
                <ul>
                    {pendingFriendRequests.map((PendingFriendRequests) => (
                        <div key={PendingFriendRequests.uid} className="nearby-user">
                            <div className="row">
                                <div className="col-md-2 col-sm-2">
                                    <img src={PendingFriendRequests.image} alt="user" className="profile-photo-lg" />
                                </div>
                                <div className="col-md-7 col-sm-7">
                                    <h5>
                                        <a href="#" className="profile-link">
                                            {PendingFriendRequests.name}
                                        </a>                          
                                        <button className="btn btn-primary pull-right" onClick={() => rejectFriendRequest(user.uid)}>Reject</button>
                                        <button className="btn btn-primary pull-right" onClick={() => acceptFriendRequest(user.uid)}>Accept</button>
                                    </h5>
                                </div>
                            </div>
                        </div>
                    ))}
                </ul>
            </div>
        ) : (
            <p>No Requests!.</p>
        )}
        </div>
    </div>
    </div>
</div>
</div> */