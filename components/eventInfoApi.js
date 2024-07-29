import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

// API endpoint to get curent user is owner event data
router.get('/events/:uid', async (req, res) => {
    try {
        let uid = req.params.uid;
        let [rows] = await connection.query('SELECT event_id, event_name, event_datetime, location, description, max_guests_count, current_guests_count, invited_guests_count, event_status, event_type , image_url, creator_uid FROM events WHERE creator_uid = ?', [uid]);
        res.status(200).json(rows); 
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving event data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get events the current user is an invited guest
router.get('/events/invited/:uid', async (req, res) => {
    let uid = req.params.uid;

    try {
        const query = `
            SELECT e.event_id, e.event_name, e.creator_uid, e.event_datetime, e.location, e.event_status, e.event_type, e.image_url, u.username AS creator_username
            FROM events AS e
            JOIN event_guests AS eg ON e.event_id = eg.event_id
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE eg.guest_uid = ? AND status IN ('invited')
        `;

        let [rows] = await connection.query(query, [uid]);

        res.status(200).json(rows);
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving joined events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get events the current user is a joined guest
router.get('/events/joined/:uid', async (req, res) => {
    let uid = req.params.uid;

    try {
        const query = `
            SELECT e.event_id, e.event_name, e.creator_uid, e.event_datetime, e.location, e.event_status, e.event_type, e.image_url, u.username AS creator_username
            FROM events AS e
            JOIN event_guests AS eg ON e.event_id = eg.event_id
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE eg.guest_uid = ? AND status IN ('joined')
        `;

        let [rows] = await connection.query(query, [uid]);

        res.status(200).json(rows);
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving joined events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to get all guests ids (invited and joined) for a given event
router.get('/events/guestIds/:eventId', async (req, res) => {
    try {
        let eventId = req.params.eventId;
        let connection = await pool.getConnection(); 

        let [rows] = await connection.query(`
            SELECT guest_uid
            FROM event_guests
            WHERE event_id = ? AND status IN ('joined', 'invited')
        `, [eventId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        let allGuests = rows.map(row => row.guest_uid);

        res.status(200).json({ guests: allGuests });
        console.log(allGuests);
    } catch (error) {
        console.error('Error retrieving event guests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release(); 
        }
    }
});

// API endpoint to get admin info for a given event

router.get('/events/ownerInfo/:eventId', async (req, res) => {
    try {
        let eventId = req.params.eventId;
        let connection = await pool.getConnection(); 

        let [rows] = await connection.query(`
            SELECT *
            FROM events
            WHERE event_id = ? 
        `, [eventId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json(rows);
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving event guests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release(); 
        }
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
            SELECT e.event_id, e.event_name, e.location, e.event_datetime, e.current_guests_count, e.max_guests_count, e.description, e.event_type, e.image_url, e.creator_uid, u.username AS creator_username
            FROM events AS e
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE e.event_status = 'public,open'
            AND (e.current_guests_count < e.max_guests_count OR e.current_guests_count IS NULL);
        `);
        
        res.status(200).json(rows);
        console.log(rows); 
    } catch (error) {
        console.error('Error retrieving public events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
 
export default router;