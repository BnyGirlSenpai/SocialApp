import express from 'express';
import { createPool} from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3001;
const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
const connection = await pool.getConnection();

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3000/SettingsPage','http://localhost:3000/FriendPage','http://localhost:3000/NotificationPage'], // Allow requests from your frontend's origin
    credentials: true // Optional, to allow cookies if needed
}));

// Define the main function for fetching data from the Ticketmaster API
/*
async function fetchEventData() {
    const page = 3;
    const classificationName = 'music';
    const countryCode = 'DE';
    const city = 'Cologne';
    const apikey = process.env.API_KEY; //missing in .env
    const size = 4;

    const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=${encodeURIComponent(classificationName)}&countryCode=${encodeURIComponent(countryCode)}&city=${encodeURIComponent(city)}&apikey=${encodeURIComponent(apikey)}&size=${size}&page=${page}`;

    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching events from Ticketmaster API:', error);
        throw error;
    }
}

// API endpoint to get events from the Ticketmaster API
app.get('/api/events', async (req, res) => {
    try {
        const eventData = await fetchEventData();
        res.json(eventData);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
*/  

// API endpoint to get User Profile data
app.get('/api/users/:uid', async (req, res) => {
    try {
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT uid, authprovider, email, displayName, photoURL, country,region, username, phoneNumber, address, password, dateOfBirth FROM users WHERE uid = ?', [uid]);
      if (rows.length > 0) {
        res.status(200).json(rows);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get User Search data 
app.get('/api/users/search/:username', async (req, res) => {
    try {
      let username = req.params.username;
      console.log(username);
      let [rows] = await connection.query('SELECT uid, photoURL, username FROM users WHERE username LIKE CONCAT(\'%\', ?, \'%\')', [username]);
      if (rows.length > 0) {
        res.status(200).json(rows);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get pending Friend Requests data
app.get('/api/users/friendrequests/:uid', async (req, res) => {
    try {
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT u.photoUrl, u.username , u.uid FROM friendrequests AS ur JOIN users AS u ON ur.uid_transmitter = u.uid WHERE ur.uid_receiver = ? AND ur.status = "pending"',[uid]);
      console.log(rows);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get Friends data
app.get('/api/users/friends/:uid', async (req, res) => {
    try {
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT u.photoUrl, u.username , u.uid FROM friends AS f JOIN users AS u ON f.user_uid2 = u.uid WHERE f.user_uid1 = ?',[uid]);
      console.log(rows);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to update Friend Request Status and Store Data 
app.post('/api/users/friendrequests', async (req, res)=> {
    let receivedData = req.body;
    let friendrequestData = JSON.parse(receivedData.body);
    console.log(friendrequestData);
    let uid_transmitter = friendrequestData.senderUserUid;
    let uid_receiver= friendrequestData.targetUserUid;
    
    let selectQuery = 'SELECT COUNT(*) AS count FROM friendrequests WHERE uid_transmitter = ? AND uid_receiver = ?';

    try {
        let [results] = await connection.query(selectQuery, [uid_transmitter, uid_receiver]);
        let userCount = results[0].count;

        if (userCount > 0) {
            console.log('Friend Request already exists!');
        } else {
            let insertQuery = 'INSERT INTO friendrequests (uid_transmitter, uid_receiver) VALUES (?, ?)';
            await connection.query(insertQuery, [uid_transmitter, uid_receiver]);
            console.log("User data saved");
        }
        connection.release();
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// API endpoint to store User data
app.post('/api/users', async (req, res) => {
    let receivedData = req.body;
    let userData = JSON.parse(receivedData.body);
    let providerData = userData.providerData;
    let uid = userData.uid;
    let selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE uid = ?';

    try {
        let [results] = await connection.query(selectQuery, [uid]);
        let userCount = results[0].count;

        if (userCount > 0) {      
            console.log('User already exists!');
        } else {       
            let insertQuery = 'INSERT INTO users (uid, authprovider, email, displayName, photoURL) VALUES (?, ?, ?, ?, ?)';
            await connection.query(insertQuery, [uid, providerData?.[0]?.providerId, userData?.email, userData?.displayName, userData?.photoURL]);
            console.log("User data saved");
        }
        connection.release();
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// API endpoint to update User data
app.post('/api/users/update', async (req, res) => {
    console.log(req.body);
    let userData = req.body;
    let uid = userData.uid;

    // Check if uid already exists in the database
    const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE uid = ?';
    try {
        let connection = await pool.getConnection();
        let [results] = await connection.query(selectQuery, [uid]);
        let userCount = results[0].count;

        if (userCount === 1) {
            // User already exists, update data
            let updateFields = [];
            let updateValues = [];

            // Construct the UPDATE query dynamically based on provided fields
            Object.keys(userData).forEach(key => {
                if (key !== 'uid' && key !== '0' && userData[key] !== undefined) {
                    console.log(updateFields);
                    // Construct each assignment properly
                    updateFields.push(`${key} = ?`);
              
                    updateValues.push(userData[key]);
                }
            });

            if (updateFields.length > 0) {
                // Update only if there are fields to update
                updateValues.push(uid); // Push UID for WHERE clause
                let updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE uid = ?`;
             
                // Use async/await for the UPDATE query
                await connection.query(updateQuery, updateValues);
                console.log('User data updated');
            } else {
                console.log('No fields provided for update');
            }
        }
        // Release connection back to the pool
        connection.release();
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
