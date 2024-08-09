import { getConnection } from '../config/db.js';

export const calendarEvents = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const uid = req.params.uid;
        const [rows] = await connection.query(
            `SELECT DISTINCT e.event_id, e.event_name, e.event_datetime
             FROM events e
             LEFT JOIN event_guests eg ON e.event_id = eg.event_id
             WHERE e.creator_uid = ? OR eg.guest_uid = ? AND status = "joined"`,
            [uid, uid]
        );
        res.status(200).json({ events: rows });
        console.log("Loaded events data from server:", rows);
    } catch (error) {
        console.error('Error retrieving event data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};