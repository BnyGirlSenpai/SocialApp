import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { UserAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AcceptRejectFriendRequest = () => {
    const { user } = UserAuth();
    const collectionUserRef = collection(db, 'users');
    const [pendingFriendRequests, setPendingFriendRequests] = useState([]);

    const getPendingFriendRequests = async (uid) => {
        try {
            const q = query(collectionUserRef, where('uid', '==', uid));
            const querySnapshot = await getDocs(q);
            // Assuming each document has a field called 'friendRequests'
            const userData = querySnapshot.docs[0].data();
            const friendRequests = userData.friendRequests || [];
            setPendingFriendRequests(friendRequests);
        } catch (error) {
            console.error('Error querying Firestore:', error);
        }
    };

    useEffect(() => {
        if (user) {
            getPendingFriendRequests(user.uid);
        }

        // Cleanup function to handle asynchronous tasks when the component is unmounted
        return () => {
            // Add any cleanup logic if needed
        };
    }, [collectionUserRef, user]);

    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-md-8">
                        <div>
                            {pendingFriendRequests.length > 0 ? (
                                <div>
                                    <h2>Pending Friend Requests</h2>
                                    <ul>
                                        {pendingFriendRequests.map((friendRequest) => (
                                            <div key={friendRequest.id} className="nearby-user">
                                                <div className="row">
                                                    <div className="col-md-2 col-sm-2">
                                                        <img src={friendRequest.image} alt="friend" className="profile-photo-lg" />
                                                    </div>
                                                    <div className="col-md-7 col-sm-7">
                                                        <h5>
                                                            <a href="#" className="profile-link">
                                                                {friendRequest.name}
                                                            </a>
                                                        </h5>
                                                    </div>
                                                    <div className="col-md-3 col-sm-3">{/* Additional actions if needed */}</div>
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
        </div>
    );
};

export default AcceptRejectFriendRequest;





/* <button className="btn btn-primary pull-right" onClick={() => rejectFriendRequest(friend.id)}>Reject</button>
<button className="btn btn-primary pull-right" onClick={() => acceptFriendRequest(friend.id)}>Accept</button>*/

 /* const acceptFriendRequest = async (friendId) => {
      try {
          const userRef = collectionUserRef.doc(user.uid);
          await updateDoc(userRef, {
              pendingFriendRequests: arrayUnion({ id: friendId, status: 'accepted' }),
          });
      } catch (error) {
          console.error('Error accepting friend request:', error);
      }
  };

  const rejectFriendRequest = async (friendId) => {
      try {
          // Implement the logic to reject the friend request
          console.log('Friend request rejected:', friendId);
      } catch (error) {
          console.error('Error rejecting friend request:', error);
      }
  };*/