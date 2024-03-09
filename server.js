import express from 'express';
import axios from 'axios';
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());

// Define the main function for fetching data from the Ticketmaster API
async function fetchEventData() {
    const page = 3;
    const classificationName = 'music';
    const countryCode = 'DE';
    const city = 'Cologne';
    const apikey = process.env.API_KEY;
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

// API endpoint to get events from the UserAuth 
app.post('/api/store-user', async (req, res) => {
    try {
      const user = req.body;
      const query = "INSERT INTO users (uid, authprovider, name, email, image) VALUES (?, ?, ?, ?, ?)"; 
      const values = [user.uid, user.providerId, user.displayName, user.email, user.photoURL];
      await connection.query(query, values);
      res.status(200).json({ message: 'User stored successfully' });
    } catch (error) {
      console.error("Error storing user in SQL:", error);
      res.status(500).json({ error: 'Failed to store user' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
