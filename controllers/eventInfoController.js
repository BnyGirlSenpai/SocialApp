import { getConnection } from '../config/db.js';

export const allGuests  =  async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let event_id = req.params.event_id;
        let [rows] = await connection.query(`
            SELECT eg.guest_uid, u.username, u.photo_url
            FROM event_guests eg
            JOIN users u ON eg.guest_uid = u.uid
            WHERE eg.event_id = ? AND eg.status IN ('joined', 'invited')
        `, [event_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        let allGuests = rows.map(row => ({
            guest_uid: row.guest_uid,
            username: row.username,
            photo_url: row.photo_url
        }));

        res.status(200).json({ guests: allGuests });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

export const invited  = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let uid = req.params.uid;
        const query = `
            SELECT e.event_id, e.event_name, e.creator_uid, e.event_datetime, e.location, e.event_status, e.event_type, e.image_url, u.username AS creator_username
            FROM events AS e
            JOIN event_guests AS eg ON e.event_id = eg.event_id
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE eg.guest_uid = ? AND status IN ('invited')
        `;
        let [rows] = await connection.query(query, [uid]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const detail = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let event_id = req.params.event_id;
        let [rows] = await connection.query(`
            SELECT *
            FROM events
            WHERE event_id = ?
        `, [event_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        let eventInfo = rows[0]; 
        res.status(200).json(eventInfo);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const owner = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const uid = req.params.uid;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 1;
        const offset = (page - 1) * limit;
        const [totalRows] = await connection.query('SELECT COUNT(*) AS count FROM events WHERE creator_uid = ?', [uid]);
        const totalCount = totalRows[0].count;
        const hasMore = (totalCount > page * limit);
        const [rows] = await connection.query(
            'SELECT event_id, event_name, event_datetime, location, description, max_guests_count, current_guests_count, invited_guests_count, event_status, event_type, image_url, creator_uid FROM events WHERE creator_uid = ? LIMIT ? OFFSET ?',
            [uid, limit, offset]
        );
        res.status(200).json({ events: rows, hasMore });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const joined = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const uid = req.params.uid;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 3; 
        const offset = (page - 1) * limit;
        const [totalRows] = await connection.query('SELECT COUNT(*) AS count FROM events AS e JOIN event_guests AS eg ON e.event_id = eg.event_id WHERE eg.guest_uid = ? AND eg.status IN ("joined")', [uid]);
        const totalCount = totalRows[0].count;
        const hasMore = (totalCount > page * limit);
        const [rows] = await connection.query(
            `SELECT e.event_id, e.event_name, e.creator_uid, e.event_datetime, e.location, e.event_status, e.event_type, e.image_url, u.username AS creator_username
            FROM events AS e
            JOIN event_guests AS eg ON e.event_id = eg.event_id
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE eg.guest_uid = ? AND eg.status IN ('joined') 
            LIMIT ? OFFSET ?`,
            [uid, limit, offset]
        );

        res.status(200).json({ events: rows, hasMore });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const publicEvents = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 3);
        const offset = (page - 1) * limit; 
        const [rows] = await connection.query(`
            SELECT e.event_id, e.event_name, e.location, e.event_datetime, e.current_guests_count, e.max_guests_count, 
                   e.description, e.event_type, e.image_url, e.creator_uid, u.username AS creator_username
            FROM events AS e
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE e.event_status = 'public,open'
            AND (e.current_guests_count < e.max_guests_count OR e.current_guests_count IS NULL)
            LIMIT ? OFFSET ?;
        `, [limit, offset]);
        
        const [[{ total }]] = await connection.query(`
            SELECT COUNT(*) AS total
            FROM events AS e
            WHERE e.event_status = 'public,open'
            AND (e.current_guests_count < e.max_guests_count OR e.current_guests_count IS NULL);
        `);

        res.status(200).json({
            events: rows,
            page: page,
            hasMore: offset + rows.length < total,
            total: total
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
