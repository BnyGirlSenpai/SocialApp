import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { UserAuth } from '../context/AuthContext';
import { collection, query, where, getDocs,updateDoc,arrayUnion } from 'firebase/firestore';

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
            const PendingFriendRequests = userData.PendingFriendRequests|| [];
            setPendingFriendRequests(PendingFriendRequests);
        } catch (error) {
            console.error('Error querying Firestore:', error);
        }
    };

    useEffect(() => {
        if (user) {
            getPendingFriendRequests(user.uid);
        }
        return () => {
        };
    }, [collectionUserRef, user]);

    const acceptFriendRequest = async (uid) => {
      try {
        const q = query(collectionUserRef, where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
     
        if (querySnapshot.empty) {
            console.log("Failed to accept Friend Request");
          return;
        }
        const targetUserData = querySnapshot.docs[0];
        await updateDoc(targetUserData.ref, {
          PendingFriendRequests: arrayUnion({status: 'accepted'}),
        });
      } catch (error) {
        console.error('Error accepting friend request:', error);
      }
    };

    const rejectFriendRequest = async (uid) => {
      try {
        const q = query(collectionUserRef, where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
       
        if (querySnapshot.empty) {
          console.log("Failed to reject Friend Request");
          return;
        }
        const targetUserData = querySnapshot.docs[0];

        await updateDoc(targetUserData.ref, {
          PendingFriendRequests: arrayUnion({status: 'rejected'}),
        });
      } catch (error) {
        console.error('Error rejecting friend request:', error);
      }
    };

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
                            {pendingFriendRequests.map((PendingFriendRequests) => (
                                <div key={PendingFriendRequests.uid} className="nearby-user">
                                    <div className="row">
                                        <div className="col-md-2 col-sm-2">
                                            <img src={PendingFriendRequests.image} alt="friend" className="profile-photo-lg" />
                                        </div>
                                        <div className="col-md-7 col-sm-7">
                                            <h5>
                                                <a href="#" className="profile-link">
                                                    {PendingFriendRequests.name}
                                                </a>
                                                
                                                <button className="btn btn-primary pull-right" onClick={() => rejectFriendRequest(user.uid)}>Reject</button>
                                                <button className="btn btn-primary pull-right" onClick={() => acceptFriendRequest(user.uid)}>Accept</button>
                                            </h5>
                                        </div>
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
