import React, { useState , useEffect} from 'react';
import { db } from '../firebase';
import { UserAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import '../styles/userlist.css';

const UserSearch = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const collectionUserRef = collection(db, "users");
  const user = UserAuth();

  const searchUser = async () => {
    try {
      const results = await searchUserInFirestore(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.log('Error searching for users:', error);
    }
  };

  const searchUserInFirestore = async (term) => {
    try {
      const q = query(collectionUserRef, where('username', '>=', term), where('username', '<=', term + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const results = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        results.push({
          id: doc.id,
          username: userData.username,
          image: userData.image,
        });
      });

      return results;
    } catch (error) {
        console.error('Error querying Firestore:', error);
      return [];
    }
  };

  const handleSendFriendRequest = async (targetUsername) => {
    try {
      const q = query(collection(db, "users"), where("username", "==", targetUsername));
      const querySnapshot = await getDocs(q);
     
      if (querySnapshot.empty) {
          console.log("Target user not found.");
        return;
      }

      if (user || user.user.uid || user.user.photoURL || user.user.displayName) {
          const targetUserData = querySnapshot.docs[0];
          await updateDoc(targetUserData.ref, {
            PendingFriendRequests: arrayUnion({
              uid: user.user.uid,
              image: user.user.photoURL,
              name: user.user.displayName,
              //username: currentUsername,
            })
          });
          console.log("Friend request sent!");
        return;
      }
      else{
        console.log("Invalid User Data!");
      }
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
              {searchResults.length > 0 ? (
                <div>
                  <h2>Search Results</h2>
                  <ul>
                    {searchResults.map((user) => (
                      <div key={user.id} className="nearby-user">
                        <div className="row">
                          <div className="col-md-2 col-sm-2">
                            <img src={user.image} alt="user" className="profile-photo-lg" />
                          </div>
                          <div className="col-md-7 col-sm-7">
                            <h5><a href="#" className="profile-link">{user.username}</a></h5>
                          </div>
                          <div className="col-md-3 col-sm-3">
                            <button className="btn btn-primary pull-right" onClick={() => handleSendFriendRequest(user.username)}>Add Friend</button>
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