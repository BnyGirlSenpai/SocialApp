import React, { useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend }  from '../apis/UserDataApi';

const FriendList = () => {
  const { user } = UserAuth();
  useEffect(() => {
    const fetchData = async () => {
        try {
            if (user) {
                const data = await getDataFromBackend(`http://localhost:3001/api/users/friends/${user.uid}`);
                console.log("Loaded data from server:", data);
            }  
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    fetchData();
    return () => {
    };
  }, [user]);
  
  return (
    <div>FriendList</div>
  )
}

export default FriendList