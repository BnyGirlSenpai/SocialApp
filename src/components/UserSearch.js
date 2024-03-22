import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import '../styles/userlist.css';
import { getDataFromBackend, sendDataToBackend } from '../apis/UserDataApi';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const { user } = UserAuth(); // Corrected user destructuring

  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        if (user) {
          const data = await getDataFromBackend(`http://localhost:3001/api/users/friends/${user.uid}`);
          setUserFriends(data);
        }
      } catch (error) {
        console.error("Error fetching user friends:", error);
      }
    };
    fetchUserFriends();
  }, [user]);

  const searchUser = async () => {
    try {
      const results = await searchUserInDb(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.log('Error searching for users:', error);
    }
  };

  const searchUserInDb = async (searchTerm) => {
    try {
      const data = await getDataFromBackend(`http://localhost:3001/api/users/search/${searchTerm}`);
      console.log("Loaded data from server:", data);
      return data; 
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; 
    }
  };

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

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <input type="text" placeholder="Search for users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={searchUser}>Search</button>
            <div className="people-nearby">
              {searchResults !== null && searchResults.length > 0 ? (
                <div>
                  <h2>Search Results</h2>
                  <ul>
                    {searchResults.map((searchUser) => (
                      <div key={searchUser.uid} className="nearby-user">
                        <div className="row">
                          <div className="col-md-2 col-sm-2">
                            <img src={searchUser.photoURL} alt={searchUser.username} className="profile-photo-lg" />
                          </div>
                          <div className="col-md-7 col-sm-7">
                          <h5><a href={`/profilepage/${searchUser.uid}`} className="profile-link">{searchUser.username}</a></h5>
                          </div>
                          <div className="col-md-3 col-sm-3">
                            {searchUser.uid !== user.uid && (
                              isFriend(searchUser.uid) ? (
                                <p>Already Friends</p>
                              ) : (
                                <button className="btn btn-primary pull-right" onClick={() => handleSendFriendRequest(searchUser.uid)}>Add Friend</button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No users found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
