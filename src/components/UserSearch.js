import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
import '../styles/userlist.css';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const collectionUserRef = collection(db, "users");

  const searchUser = async () => {
    try {
      // Call the searchUser function and update the state with the results
      const results = await searchUserInFirestore(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.log('Error searching for users:');
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

  return (
    <div>
        <div class="container">
            <div class="row">
                <div class="col-md-8">
                <input type="text" placeholder="Search for users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button onClick={searchUser}>Search</button>
                <div class="people-nearby">   

                {searchResults.length > 0 ? (
                    <div>
                    <h2>Search Results</h2>
                        <ul>
                        {searchResults.map((user) => (
                            <div key={user.id} class="nearby-user">
                                <div class="row">
                                    <div class="col-md-2 col-sm-2">
                                        <img src={user.image}  alt="user" class="profile-photo-lg"/>
                                    </div>
                                    <div class="col-md-7 col-sm-7">
                                        <h5><a href="#" class="profile-link">{user.username}</a></h5>
                                        <p>Software Engineer</p>
                                        <p class="text-muted">500m away</p>
                                    </div>
                                    <div class="col-md-3 col-sm-3">
                                        <button class="btn btn-primary pull-right">Add Friend</button>
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
