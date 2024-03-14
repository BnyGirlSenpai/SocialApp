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
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3000/SettingsPage'], // Allow requests from your frontend's origin
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

// API endpoint to get User data
app.get('/api/users/:uid', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const uid = req.params.uid;
      const [rows] = await connection.query('SELECT * FROM users WHERE uid = ?', [uid]);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to store User data
app.post('/api/users', async (req, res) => {
    const receivedData = req.body;
    const userData = JSON.parse(receivedData.body);
    const providerData = userData.providerData;
    const uid = userData.uid;

    // Check if uid already exists in the database
    const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE uid = ?';

    try {
        const connection = await pool.getConnection();

        // Use async/await for the SELECT query
        const [results] = await connection.query(selectQuery, [uid]);

        const userCount = results[0].count;

        if (userCount > 0) {
            // User already exists, do nothing
            console.log('User already exists!');
        } else {
            // User does not exist, insert data
            const insertQuery = 'INSERT INTO users (uid, authprovider, email, displayName, photoURL) VALUES (?, ?, ?, ?, ?)';
            // Use async/await for the INSERT query
            await connection.query(insertQuery, [uid, providerData?.[0]?.providerId, userData?.email, userData?.displayName, userData?.photoURL]);
            console.log("User data saved");
        }

        // Release connection back to the pool
        connection.release();
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// API endpoint to update User data
app.post('/api/users/update', async (req, res) => {
    const receivedData = req.body;
    const userData = JSON.parse(receivedData.body);
    const uid = userData?.[0]?.uid;

    // Check if uid already exists in the database
    const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE uid = ?';
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query(selectQuery, [uid]);
        const userCount = results[0].count;

        if (userCount = 1) {
            // User already exists, update data
            const updateQuery = 'UPDATE users SET email = ?, country = ?, region = ?, username = ? , phoneNumber = ?, address = ?, password = ?, dateOfBirth = ? WHERE uid = ?';
            // Use async/await for the UPDATE query
            await connection.query(updateQuery, [userData?.[0]?.email, userData?.[0]?.country, userData?.[0]?.region, userData?.[0]?.username, userData?.[0]?.phoneNumber,userData?.[0]?.adress, userData?.[0]?.password, userData?.[0]?.dateOfBirth, userData?.[0]?.uid]);
            console.log('User data updated');
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
