import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDataFromBackend, sendDataToBackend, updateDataInDb } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import Button from '@mui/material/Button';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import '../styles/profile.css';

const Profile = () => {
  const { uid } = useParams(); 
  const [userData, setUserData] = useState(null); 
  const { user } = UserAuth(); 
  const [userFriends, setUserFriends] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDataFromBackend(`http://localhost:3001/api/users/${uid}`);
        if (data) {
          setUserData(data);
          setIsCurrentUser(data[0].uid === user.uid);

          if (user && !isCurrentUser) {
            const friendsData = await getDataFromBackend(`http://localhost:3001/api/users/friends/${user.uid}`);//verbessern
            setUserFriends(friendsData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [uid, user]);

  const isFriend = (userId) => {
    return userFriends.some(friend => friend.uid === userId);
  };

  const handleSendFriendRequest = async (targetUserUid) => {
    try {
      const requestData = {
        senderUserUid: user.uid,
        targetUserUid: targetUserUid
      };
      sendDataToBackend(requestData,`http://localhost:3001/api/users/friendrequests`);
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const removeFriend = async (friendUid,userUid) => { 
    try {
        let updateData = {
            status: 'unfriended',
            uid_transmitter: userUid, 
            uid_receiver: friendUid
        };
        updateDataInDb(updateData,`http://localhost:3001/api/users/update/friendrequests`)
        } catch (error) {
        console.error("Error removing friend:", error);
    }
  };

return (
    <div className="container">
      {userData ? (
        <div id="user-profile-2" className="user-profile">
            <div className="tabbable">  
              <div className="tab-content no-border padding-24">
                <div id="home" className="tab-pane in active">
                  <div className="row">
                    <div className="col-xs-12 col-sm-3 center">
                      <span className="profile-picture">
                       <img className="editable img-responsive" src={userData?.[0]?.photoURL} alt={userData?.[0]?.username} id="avatar2"/>
                      </span> 
                      {!isCurrentUser && (isFriend(userData[0].uid) ? (
                        <div>
                          <a href="" className="btn btn-sm btn-block btn-primary" style={{ backgroundColor: 'red' }} onClick={() =>{ removeFriend(userData[0].uid,user.uid); removeFriend(user.uid,userData[0].uid);}}>
                           <i className="ace-icon fa fa-envelope-o bigger-110"></i>
                            <span className="bigger-110">Remove Friend</span>
                          </a>
                          <a href="#" className="btn btn-sm btn-block btn-primary">
                            <i className="ace-icon fa fa-envelope-o bigger-110"></i>
                            <span className="bigger-110">Send a message</span>
                          </a>
                        </div>
                        ) : (             
                        <div>      
                          <div className="space space-4"></div>        
                          <a href="#" className="btn btn-sm btn-block btn-success" onClick={() => handleSendFriendRequest(userData[0].uid)}>
                            <i className="ace-icon fa fa-plus-circle bigger-120"></i>
                            <span className="bigger-110">Add as a friend</span>
                          </a>       
                          <a href="#" className="btn btn-sm btn-block btn-primary">
                            <i className="ace-icon fa fa-envelope-o bigger-110"></i>
                            <span className="bigger-110">Send a message</span>
                          </a>
                        </div>                  
                        )
                      )}
                    </div>       
                    <div className="col-xs-12 col-sm-9">
                      <h4 className="blue">
                        <span className="middle">{userData?.[0]?.username}</span>
                      </h4>
                      <div className="profile-user-info">
                        <div className="profile-info-row">
                          <div className="profile-info-name"> Username: </div>
                          <div className="profile-info-value">
                           <span>{userData?.[0]?.username}</span>
                          </div>
                        </div>
                        <div className="profile-info-row">
                          <div className="profile-info-name"> Location: </div>
                          <div className="profile-info-value">
                            <i className="fa fa-map-marker light-orange bigger-110"></i>
                            <span>{userData?.[0]?.country}</span>
                            <span>{userData?.[0]?.region}</span>
                          </div>
                        </div>
                        <div className="profile-info-row">
                          <div className="profile-info-name"> Date of Birth: </div>
                          <div className="profile-info-value">
                            <span>{userData?.[0]?.dateOfBirth}</span>
                          </div>
                        </div>
                        <div className="profile-info-row">
                          <div className="profile-info-name"> Joined: </div>
                          <div className="profile-info-value">
                            <span>{formatLocalDateTime(userData?.[0].created_at).slice(0,10)}</span> 
                          </div>
                        </div>
                      </div>
                      <div className="hr hr-8 dotted"></div>
                    </div>
                  </div>
                  <div className="space-20"></div>
                  <div className="row">
                    <div className="col-xs-12 col-sm-6">
                      <div className="widget-box transparent">
                        <div className="widget-header widget-header-small">
                          <h4 className="widget-title smaller">
                            <i className="ace-icon fa fa-check-square-o bigger-110"></i>
                              <span>About {userData?.[0]?.username}</span>
                          </h4>
                        </div>
                        <div className="widget-body">
                          <div className="widget-main">
                            <span>{userData?.[0]?.description}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      ) : (
        <p>Loading...</p>
      )}
      {isCurrentUser && (
        <div>
          <a href="/ProfileSettingsPage">
            <Button variant="contained" >Edit Profile</Button >
          </a>
        </div>
      )}
    </div>
  );
};

export default Profile;



