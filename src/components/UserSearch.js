import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

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
      console.error('Error searching for users:', error);
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
      <input
        type="text"
        placeholder="Search for users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={searchUser}>Search</button>

      {searchResults.length > 0 ? (
        <div>
          <h2>Search Results</h2>
          <ul>
            {searchResults.map((user) => (
              <li key={user.id}>{user.username}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default UserSearch;
