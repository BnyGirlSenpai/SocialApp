import express from 'express';
import axios from 'axios';
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();
const port = 3001;
const corsOptions = {origin: 'http://localhost:3000'};

app.use(cors(corsOptions));app.use(express.json());

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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
