import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend, sendDataToBackend } from '../apis/UserDataApi';
import '../styles/friendDropDown.css'; 

const FriendDropDown = ({ eventId, onInvite }) => { 
  const { user } = UserAuth();
  const [friendsData, setFriendsData] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [guestsData, setGuestsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          let friends = await getDataFromBackend(`http://localhost:3001/api/users/friends/${user.uid}`);
          let guests = await getDataFromBackend(`http://localhost:3001/api/events/allGuests/${eventId}`);

          console.log("Loaded friends data from server:", friends);
          console.log("Loaded guests data from server:", guests);
          
          setFriendsData(friends);
          setGuestsData(guests); 
        }  
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [user, eventId]);
  
  const inviteFriends = async (eventId) => {
    if (selectedFriends.length === 0) {
      console.log("No friends selected for invitation.");
      onInvite();
      return;
    }
    console.log("Inviting friends to event with ID:", eventId);
    console.log("Selected friends:", selectedFriends);
    try {
      await sendDataToBackend(selectedFriends, `http://localhost:3001/api/events/invites/${eventId}`);
      onInvite();
    } catch (error) {
      console.error("Error sending invites:", error);
    }
  };

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
        {friendsData.map((friend, index) => {
          const isInvitedOrJoined = guestsData.some(guest => guest.uid === friend.uid);
          return (
            <div key={index} className="friend-item">
              {isInvitedOrJoined ? (
                <span>Already Invited</span>
              ) : (
                <input
                  type="checkbox"
                  id={`friend-${friend.uid}`}
                  value={friend.uid}
                  checked={selectedFriends.includes(friend.uid)}
                  onChange={() => handleCheckboxChange(friend.uid)}
                />
              )}
              <label htmlFor={`friend-${friend.uid}`}>{friend.username}</label>
              <img src={friend.photoUrl} alt={friend.username} />
            </div>
          );
        })}
      </div>
      <div className="button-container">                                   
          <button onClick={() => inviteFriends(eventId)}>Invite Selected Friends</button>       
      </div>          
    </div>
  );
}

export default FriendDropDown;
