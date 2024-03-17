import axios from 'axios';

const sendDataToBackend = async (data,endpoint) => {
  try {
      let response = await axios.post(endpoint, {
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

const updateUserDataInDb = async (data,endpoint) => {
  try {
    let response = await axios.post(endpoint,data,
      {
        headers: { 'Content-Type': 'application/json' } // Set headers separately
      }
    );
    if (response.status === 200) { // Check status instead of response.ok
      console.log(data);
      console.log('Data send successfully');
    } else {
      console.error('Error storing data:', response);
    }
  } catch (error) {
    console.error('Error sending data to backend:', error);
  }
};

const getDataFromBackend = async (endpoint) => {
  try {
    let response = await axios.get(endpoint);

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

export {sendDataToBackend ,getDataFromBackend ,updateUserDataInDb};