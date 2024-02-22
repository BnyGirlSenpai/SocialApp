import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { UserAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";

const AcceptRejectFriendRequest = () => {
    const { user } = UserAuth();
    const collectionUserRef = collection(db, "users");
    const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
/*
    useEffect(() => {
        const getPendingFriendRequests = async () => {
            try {
                if (user && user.uid) {
                const q = query(collectionUserRef, where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const results = [];
            
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
            
                    // Assuming each document has a field called 'pendingFriendRequests'
                    const pendingFriendRequests = userData.pendingFriendRequests;
            
                    // Check if 'pendingFriendRequests' exists and is an object
                    if (pendingFriendRequests && typeof pendingFriendRequests === 'object') {
                    results.push({
                        id: doc.id,
                        username: pendingFriendRequests.username,
                        image: pendingFriendRequests.image,
                    });
                    }
                });
          
                setPendingFriendRequests(results);
              } else {
                console.log("User is null or missing uid property.");
              }
            } catch (error) {
              console.error('Error querying Firestore:', error);
            }
    };

    getPendingFriendRequests();  // Call the function to fetch pending friend requests
  }, [collectionUserRef, user.uid]);

  const acceptFriendRequest = (friendId) => {
    // Implement the logic to accept the friend request
  };

  const rejectFriendRequest = (friendId) => {
    // Implement the logic to reject the friend request
  };
  */

  return (
    <div></div>
    /*
    <div>
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <div>
              {pendingFriendRequests.length > 0 ? (
                <div>
                  <h2>Pending Friend Requests</h2>
                  <ul>
                    {pendingFriendRequests.map((friend) => (
                      <div key={friend.id} className="nearby-user">
                        <div className="row">
                          <div className="col-md-2 col-sm-2">
                            <img src={friend.image} alt="friend" className="profile-photo-lg" />
                          </div>
                          <div className="col-md-7 col-sm-7">
                            <h5><a href="#" className="profile-link">{friend.username}</a></h5>
                            <p>Software Engineer</p>
                            <p className="text-muted">500m away</p>
                          </div>
                          <div className="col-md-3 col-sm-3">
                            <button className="btn btn-primary pull-right" onClick={() => rejectFriendRequest(friend.id)}>Reject</button>
                            <button className="btn btn-primary pull-right" onClick={() => acceptFriendRequest(friend.id)}>Accept</button>
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
    </div>*/
  );
};


export default AcceptRejectFriendRequest;