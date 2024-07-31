import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend, sendDataToBackend } from '../apis/UserDataApi';
import '../styles/friendDropDown.css';

const FriendDropDown = ({ event_id, onInvite, creatorUid}) => {
  const { user } = UserAuth();
  const [friendsData, setFriendsData] = useState([]);
  const [guestsData, setGuestsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const friends = await getDataFromBackend(`http://localhost:3001/api/users/friends/${user.uid}`);
          const guests = await getDataFromBackend(`http://localhost:3001/api/events/guests/${event_id}`);

          console.log("Loaded friends data from server:", friends);
          console.log("Loaded guests data from server:", guests);

          setFriendsData(friends);
          setGuestsData(guests || { guests: [] });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [user, event_id]);

  const formik = useFormik({
    initialValues: {
      selectedFriends: [],
    },
    validationSchema: Yup.object({
      selectedFriends: Yup.array().min(1, 'At least one friend must be selected').required('Required'),
    }),
    
    onSubmit: async (values) => {
      try {
        console.log("Inviting friends to event with ID:", event_id);
        let invitationData = values.selectedFriends;
        invitationData.push(user.uid);
        console.log("Invite data:", invitationData);
        await sendDataToBackend(invitationData, `http://localhost:3001/api/events/invites/${event_id}`);
        onInvite();
      } catch (error) {
        console.error("Error sending invites:", error);
      }
    },
  });

  const handleCheckboxChange = (friendId) => {
    formik.setFieldValue('selectedFriends', formik.values.selectedFriends.includes(friendId)
      ? formik.values.selectedFriends.filter(id => id !== friendId)
      : [...formik.values.selectedFriends, friendId]);
  };

  return (
    <div className="container">
      <h2>FriendList</h2>
      <form onSubmit={formik.handleSubmit}>
        <div className="friend-list">
          {friendsData.map((friend, index) => {
            const guestUids = guestsData.guests.map(guest => guest.guest_uid);
            const isInvitedOrJoined = guestUids.includes(friend.uid);
            const isOwner = friend.uid === creatorUid;
            return (
              <div key={index} className="friend-item">
                {isOwner ? (
                  <span>Owner </span> 
                ) : (
                  isInvitedOrJoined ? (
                    <span>Already Invited </span>
                  ) : (
                    <input
                      type="checkbox"
                      id={`friend-${friend.uid}`}
                      value={friend.uid}
                      checked={formik.values.selectedFriends.includes(friend.uid)}
                      onChange={() => handleCheckboxChange(friend.uid)}
                    />
                  )
                )}
                <label htmlFor={`friend-${friend.uid}`}>{friend.username}</label>
                <img src={friend.photo_url} alt={friend.username} />
              </div>
            );
          })}
        </div>
        {formik.touched.selectedFriends && formik.errors.selectedFriends ? (
          <div className="error">{formik.errors.selectedFriends}</div>
        ) : null}
        <div className="button-container">
          <button type="submit">Invite Selected Friends</button>
        </div>
      </form>
    </div>
  );
}

export default FriendDropDown;
