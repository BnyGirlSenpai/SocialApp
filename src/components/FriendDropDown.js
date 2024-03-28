import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend } from '../apis/UserDataApi';
import '../styles/friendDropDown.css'; 

const FriendDropDown = ({ eventId, onInvite }) => { 
  const { user } = UserAuth();
  const [friendsData, setFriendsData] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const data = await getDataFromBackend(`http://localhost:3001/api/users/friends/${user.uid}`);
          console.log("Loaded data from server:", data);
          setFriendsData(data); 
        }  
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [user]);
  
  function inviteFriends(eventId) {
    console.log("Inviting friends with ID:", eventId);
    console.log("Selected friends:", selectedFriends);
    
    
    onInvite();
  }

  function handleCheckboxChange(friendId) {
    setSelectedFriends(prevSelected => {
      if (prevSelected.includes(friendId)) {
        return prevSelected.filter(id => id !== friendId);
      } else {
        return [...prevSelected, friendId];
      }
    });
  }

  return (
    <div className="container">
      <h2>FriendList</h2>
      <div className="friend-list">
        {friendsData.map((friend, index) => (
          <div key={index} className="friend-item">
            <input
              type="checkbox"
              id={`friend-${friend.uid}`}
              value={friend.uid}
              checked={selectedFriends.includes(friend.uid)}
              onChange={() => handleCheckboxChange(friend.uid)}
            />
            <label htmlFor={`friend-${friend.uid}`}>{friend.username}</label>
            <img src={friend.photoUrl} alt={friend.username} />
          </div>
        ))}
      </div>
      <button onClick={() => inviteFriends(eventId)}>Invite Selected Friends</button>
    </div>
  );
}

export default FriendDropDown;
