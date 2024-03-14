import { useEffect } from 'react';
import axios from 'axios';

const sendDataToBackend = async (data) => {
  try {
      const response = await axios.post('http://localhost:3001/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      console.log(data)
      console.log('data stored successfully');
    } else {
      console.error('Error storing data:', response);
    }
  } catch (error) {
    console.error('Error sending data to backend:', error);
  }
};

const updateUserDataInDb = async (data) => {
  try {
      const response = await axios.post('http://localhost:3001/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      console.log(data)
      console.log('data updated successfully');
    } else {
      console.error('Error updating data:', response);
    }
  } catch (error) {
    console.error('Error sending data to backend:', error);
  }
};

const getDataFromBackend = async (uid) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/users/${uid}`);

    if (response.status === 200) {
      const data = response.data;
      console.log('Data retrieved successfully:', data);
      return data;
    } else {
      console.error('Error retrieving data:', response);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving data from backend:', error);
    return null;
  }
};

const UserDataApi = ({ data }) => {
  useEffect(() => {
    if (data) {
      sendDataToBackend(data);
    }
  }, [data]);
  return null;
};

export { UserDataApi, sendDataToBackend ,getDataFromBackend ,updateUserDataInDb};