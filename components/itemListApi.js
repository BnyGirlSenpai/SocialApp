import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

router.post('/events/itemList/edit/:eventId', (req, res) => {
    const { eventId } = req.params;
    const { items } = req.body;

    // Validate and process data here
    if (!items || !Array.isArray(items)) {
        return res.status(400).send({ message: 'Invalid item list' });
    }

    // Find or create event in the database
    let event = connection.events.find(e => e.id === eventId);
    if (!event) {
        event = { id: eventId, items: [] };
        connection.events.push(event);
    }

    // Update event's item list
    event.items = items;

    res.status(200).send({ message: 'Item list updated successfully' });
});
