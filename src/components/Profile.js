import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import '../styles/profile.css';

const Profile = () => {
  const { uid } = useParams(); 
  const [userData, setUserData] = useState(null); 
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { user } = UserAuth(); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getDataFromBackend(`http://localhost:3001/api/users/${uid}`);
        if (data) {
          setUserData(data);
          setIsCurrentUser(data[0].uid === user.uid);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [uid, user]);

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
                    <div className="space space-4"></div>
                    {/* Add as friend and send message buttons */}
                    {!isCurrentUser && (
                      <div>
                        <button className="btn btn-sm btn-block btn-success">
                          <i className="ace-icon fa fa-plus-circle bigger-120"></i>
                          <span className="bigger-110">Add as a friend</span>
                        </button>
                        <button className="btn btn-sm btn-block btn-primary">
                          <i className="ace-icon fa fa-envelope-o bigger-110"></i>
                          <span className="bigger-110">Send a message</span>
                        </button>
                      </div>
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
                      {/* Add more profile information here */}
                    </div>
                  </div>
                </div>
              </div>
              {/* Add more tab panes here */}
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {/* Edit profile button for the current user */}
      {isCurrentUser && (
        <div>
          <button>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
