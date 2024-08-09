import { getConnection } from '../config/db.js'; 

export const getUser = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const uid = req.params.uid;
        const [rows] = await connection.query(
            'SELECT uid, authprovider, email, display_name, photo_url, country, region, username, phone_number, address, date_of_birth, description, created_at FROM users WHERE uid = ?', 
            [uid]
        );
        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

export const store = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { uid, providerData, email, displayName, photoURL } = req.body;
        const [results] = await connection.query('SELECT COUNT(*) AS count FROM users WHERE uid = ?', [uid]);
        const userCount = results[0].count;

        if (userCount > 0) {
            res.status(200).json({ message: 'User already exists' });
        } else {
            await connection.query(
                'INSERT INTO users (uid, authprovider, email, display_name, photo_url) VALUES (?, ?, ?, ?, ?)',
                [uid, providerData?.[0]?.providerId, email, displayName, photoURL]
            );
            res.status(201).json({ success: true, message: 'User data saved' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to process data' });
    } finally {
        if (connection) connection.release();
    }
};

export const update = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [ username, email, date_of_birth, address, country, region, phone_number, description, uid] = req.body;
        const [results] = await connection.query('SELECT COUNT(*) AS count FROM users WHERE uid = ?', [uid]);
        const userCount = results[0].count;

        if (userCount === 1) {
            const updateQuery = `
                UPDATE users 
                SET username = ?, email = ?, date_of_birth = ?, address = ?, country = ?, region = ?, phone_number = ?, description = ? 
                WHERE uid = ?
            `;
            await connection.query(updateQuery, [username, email, date_of_birth, address, country, region, phone_number, description, uid]);
            res.status(200).json({ success: true, message: 'User data updated' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to process data' });
    } finally {
        if (connection) connection.release();
    }
};