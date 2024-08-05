import express from 'express';
import pool from './database.js';

const router = express.Router();
const getConnection = async () => {
    try {
        return await pool.getConnection();
    } catch (error) {
        throw new Error('Failed to get database connection');
    }
};

// API endpoint to get events the current user is either the owner or invited
router.get('/calendar/:uid', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const uid = req.params.uid;
        const [rows] = await connection.query(
            `SELECT DISTINCT e.event_id, e.event_name, e.event_datetime
             FROM events e
             LEFT JOIN event_guests eg ON e.event_id = eg.event_id
             WHERE e.creator_uid = ? OR eg.guest_uid = ?`,
            [uid, uid]
        );

        res.status(200).json({ events: rows });
        console.log("Loaded events data from server:", rows);
    } catch (error) {
        console.error('Error retrieving event data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;