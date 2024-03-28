import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDataFromBackend, sendDataToBackend, updateDataInDb } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
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
          if (user) {
            const friendsData = await getDataFromBackend(`http://localhost:3001/api/users/friends/${user.uid}`);
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
        <div id="user-profile-2" class="user-profile">
            <div class="tabbable">
              <ul class="nav nav-tabs padding-18">
                <li class="active">
                  <a data-toggle="tab" href="#home">
                    <i class="green ace-icon fa fa-user bigger-120"></i>
                    Profile
                  </a>
                </li>       
                <li>
                  <a data-toggle="tab" href="#feed">
                    <i class="orange ace-icon fa fa-rss bigger-120"></i>
                    Activity Feed
                  </a>
                </li>       
                <li>
                  <a data-toggle="tab" href="#friends">
                    <i class="blue ace-icon fa fa-users bigger-120"></i>
                    Friends
                  </a>
                </li>        
                <li>
                  <a data-toggle="tab" href="#pictures">
                    <i class="pink ace-icon fa fa-picture-o bigger-120"></i>
                    Pictures
                  </a>
                </li>
              </ul>       
              <div class="tab-content no-border padding-24">
                <div id="home" class="tab-pane in active">
                  <div class="row">
                    <div class="col-xs-12 col-sm-3 center">
                      <span class="profile-picture">
                       <img className="editable img-responsive" src={userData?.[0]?.photoURL} alt={userData?.[0]?.username} id="avatar2"/>
                      </span> 
                      {!isCurrentUser && (isFriend(userData[0].uid) ? (
                        <div>
                          <a href="" className="btn btn-sm btn-block btn-primary" style={{ backgroundColor: 'red' }} onClick={() =>{ removeFriend(userData[0].uid,user.uid); removeFriend(user.uid,userData[0].uid);}}>
                           <i class="ace-icon fa fa-envelope-o bigger-110"></i>
                            <span class="bigger-110">Remove Friend</span>
                          </a>
                          <a href="#" class="btn btn-sm btn-block btn-primary">
                            <i class="ace-icon fa fa-envelope-o bigger-110"></i>
                            <span class="bigger-110">Send a message</span>
                          </a>
                        </div>
                        ) : (             
                        <div>      
                          <div class="space space-4"></div>        
                          <a href="#" class="btn btn-sm btn-block btn-success" onClick={() => handleSendFriendRequest(userData[0].uid)}>
                            <i class="ace-icon fa fa-plus-circle bigger-120"></i>
                            <span class="bigger-110">Add as a friend</span>
                          </a>       
                          <a href="#" class="btn btn-sm btn-block btn-primary">
                            <i class="ace-icon fa fa-envelope-o bigger-110"></i>
                            <span class="bigger-110">Send a message</span>
                          </a>
                        </div>                  
                        )
                      )}
                    </div>       
                    <div class="col-xs-12 col-sm-9">
                      <h4 class="blue">
                        <span className="middle">{userData?.[0]?.username}</span>
                      </h4>
                      <div class="profile-user-info">
                        <div class="profile-info-row">
                          <div class="profile-info-name"> Username </div>
                          <div class="profile-info-value">
                           <span>{userData?.[0]?.username}</span>
                          </div>
                        </div>
                        <div class="profile-info-row">
                          <div class="profile-info-name"> Location </div>
                          <div class="profile-info-value">
                            <i class="fa fa-map-marker light-orange bigger-110"></i>
                            <span>{userData?.[0]?.country}</span>
                            <span>{userData?.[0]?.region}</span>
                          </div>
                        </div>
                        <div class="profile-info-row">
                          <div class="profile-info-name"> Date of Birth </div>
                          <div class="profile-info-value">
                            <span>{userData?.[0]?.dateOfBirth}</span>
                          </div>
                        </div>
                        <div class="profile-info-row">
                          <div class="profile-info-name"> Joined </div>
                          <div class="profile-info-value">
                            <span>{user.metadata.creationTime}</span> 
                          </div>
                        </div>
                        <div class="profile-info-row">
                          <div class="profile-info-name"> Last Online </div>
                          <div class="profile-info-value">
                            <span>{user.metadata.lastLoginAt}</span>           
                          </div>
                        </div>
                      </div>
                      <div class="hr hr-8 dotted"></div>
                    </div>
                  </div>
                  <div class="space-20"></div>
                  <div class="row">
                    <div class="col-xs-12 col-sm-6">
                      <div class="widget-box transparent">
                        <div class="widget-header widget-header-small">
                          <h4 class="widget-title smaller">
                            <i class="ace-icon fa fa-check-square-o bigger-110"></i>
                              <span>About {userData?.[0]?.username}</span>
                          </h4>
                        </div>
                        <div class="widget-body">
                          <div class="widget-main">
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
      {/* Edit profile button for the current user */}
      {isCurrentUser && (
        <div>
          <button><a href="/ProfileSettingsPage">Edit Profile</a></button>
        </div>
      )}
    </div>
  );
};

export default Profile;



