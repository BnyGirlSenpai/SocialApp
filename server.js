import express from 'express';
import axios from 'axios';
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
    origin: 'http://localhost:3000', // Allow requests from your frontend's origin
    credentials: true // Optional, to allow cookies if needed
}));

// Define the main function for fetching data from the Ticketmaster API
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

// API endpoint to receive data
app.post('/api/users', async (req, res) => {
    const receivedData = req.body;
    const userData =  JSON.parse(receivedData.body);
    const providerData = userData.providerData
    const insertQuery = 'INSERT INTO users (uid, authprovider, email, displayName, photoURL) VALUES (?, ?, ?, ?, ?)';
    try {
        console.log(providerData);
        const connection = await pool.getConnection();
        connection.query(insertQuery, [userData.uid, providerData?.[0]?.providerId, userData.email, userData.displayName, userData.photoURL], (error) => {
            if (error) {
                console.error("Database error:", error);
                res.status(500).send("Error saving data"); 
            } else {
                res.status(201).send("User data saved"); 
            }
        });

        // Release connection back to the pool
        connection.release();

        res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
