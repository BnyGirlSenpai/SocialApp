import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend }  from '../apis/UserDataApi';
import '../styles/friendlist.css'; 

const FriendList = () => {
  const { user } = UserAuth();
  const [friendsData, setFriendsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            if (user) {
                const data = await getDataFromBackend(`http://localhost:3001/api/users/friends/${user.uid}`);
                console.log("Loaded data from server:", data);
                setFriendsData(data); // Set the fetched data to state
            }  
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    fetchData();
  }, [user]);
  
  return (
    <div className="container">
        <div className="friend-list">
            <div className="row">
                {friendsData.map((friend, index) => (
                    <div className="col-md-4 col-sm-6" key={index}>
                        <div className="friend-card">
                            <div className="card-info">
                                <div className="friend-info">                                
                                    <h5><a href="ProfilePage" className="profile-link">{friend.username}</a></h5> 
                                    <img src={friend.photoUrl} alt={friend.username} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
/*/:{friend.uid} add to profilePage Link */
export default FriendList;