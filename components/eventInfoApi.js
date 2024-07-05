import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

// API endpoint to get curent user is owner event data
router.get('/events/:uid', async (req, res) => {
    try {
        let uid = req.params.uid;
        let [rows] = await connection.query('SELECT event_id, event_name, event_date, event_time, location, description, max_guests_count, current_guests_count, invited_guests_count, event_status, creator_uid FROM events WHERE creator_uid = ?', [uid]);
        res.status(200).json(rows); 
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving event data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get events the current user is an invited guest
router.get('/events/invited/:uid', async (req, res) => {
    try {
        let uid = req.params.uid;
        let [rows] = await connection.query(`
            SELECT e.event_id, e.event_name, e.creator_uid, u.username AS creator_username
            FROM events AS e
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE JSON_CONTAINS(e.invited_guests, ?)
        `, [`{"uid":"${uid}"}`, '$']);

        res.status(200).json(rows);
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving invited events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get events the current user is a joined guest
router.get('/events/joined/:uid', async (req, res) => {
    try {
        let uid = req.params.uid;
        let [rows] = await connection.query(`
            SELECT e.event_id, e.event_name, e.creator_uid, e.event_date, e.location, e.event_time, e.event_status, u.username AS creator_username
            FROM events AS e
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE JSON_CONTAINS(e.joined_guests, ?)
        `, [`{"uid":"${uid}"}`, '$']);

        res.status(200).json(rows);
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving invited events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get all guests ids (invited and joined) for a given event
router.get('/events/allGuests/:eventId', async (req, res) => {
    try {
        let eventId = req.params.eventId;
        let [rows] = await connection.query(`
            SELECT invited_guests, joined_guests
            FROM events
            WHERE event_id = ?
        `, [eventId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        let { invited_guests, joined_guests } = rows[0];

        invited_guests = JSON.parse(invited_guests || '[]');
        joined_guests = JSON.parse(joined_guests || '[]');

        let allGuests = [...invited_guests, ...joined_guests];

        res.status(200).json(allGuests);
        console.log(allGuests);
    } catch (error) {
        console.error('Error retrieving event guests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to fetch event detail information
router.get('/events/eventDetail/:eventId', async (req, res) => {
    try {
        let eventId = req.params.eventId;
        let [rows] = await connection.query(`
            SELECT *
            FROM events
            WHERE event_id = ?
        `, [eventId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        let eventInfo = rows[0]; 
        res.status(200).json(eventInfo);
        console.log(eventInfo);
    } catch (error) {
        console.error('Error retrieving event details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to fetch public events
router.get('/public/events', async (req,res) => {
    try {
        let [rows] = await connection.query(`
            SELECT e.event_id, e.event_name, e.location, e.event_time, e.event_date, e.current_guests_count, e.max_guests_count, e.description, e.creator_uid, u.username AS creator_username
            FROM events AS e
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE e.event_status = 'public' AND e.current_guests_count < e.max_guests_count
        `);
        
        res.status(200).json(rows);
        console.log(rows); 
    } catch (error) {
        console.error('Error retrieving public events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
 
export default router;