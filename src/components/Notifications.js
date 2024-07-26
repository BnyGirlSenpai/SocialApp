import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend, updateDataInDb }  from '../apis/UserDataApi';

const Notifications = () => {
    const { user } = UserAuth();
    const [userData, setUserData] = useState([]);
    const [eventData, setEventData] = useState([]);
  
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

        const fetchEventData = async () => {
            try {
                if (user) {
                    const eventDataResponse = await getDataFromBackend(`http://localhost:3001/api/events/invited/${user.uid}`);
                    console.log("Loaded event data from server:", eventDataResponse);
                    setEventData(eventDataResponse); 
                }  
            } catch (error) {
                console.error("Error fetching event data:", error);
            }
        };

        fetchUserData();
        fetchEventData();
    }, [user]); 

    //----------------------------------Friend Handling------------------------------------------//

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

    //----------------------------------Event Handling------------------------------------------//

    const acceptEventRequest = async (targetEventId) => {
        let updateData = {
            status: 'accepted',
            event_id: targetEventId,
            uid_guest: user.uid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/events/update`)
    };
    
    const rejectEventRequest = async (targetEventId) => {
        let updateData = {
            status: 'declined',
            event_id: targetEventId,
            uid_guest: user.uid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/events/update`)
    };

    //----------------------------------Form---------------------------------------------------//

    return (
        <form className="notifications-form">
        <div className="container">
            <h2>Pending Friend Requests</h2>
            <div className="friend-list" id="friend-requests">
                <div className="row">
                    {userData.map((user, index) => (
                        <div className="col-md-4 col-sm-6" key={index}>
                            <div className="friend-card">
                                <div className="card-info">
                                    <div className="friend-info">   
                                        <h5><a href={`ProfilePage/${user.uid}`} className="profile-link">{user.username}</a></h5> 
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
    
        <div className="container">
            <h2>Pending Event Requests</h2>
            <div className="event-list" id="event-requests">
                <div className="row">
                    {eventData.map((event, index) => (
                        <div className="col-md-4 col-sm-6" key={index}>
                            <div className="event-card">
                                <div className="card-info">
                                    <div className="event-info">                                
                                    <h5><a href={`/EventPage/EventDetailPage/${event.event_id}`} className="event-link">{event.event_name}</a></h5> 
                                    </div><div> 
                                        <h5>Created by <a href={`/profilepage/${event.creator_uid}`} className="profile-link">{event.creator_username}</a></h5> 
                                        <button className="btn btn-primary pull-right" onClick={() => rejectEventRequest(event.event_id)}>Reject</button>
                                        <button className="btn btn-primary pull-right" onClick={() => acceptEventRequest(event.event_id)}>Accept</button>
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

