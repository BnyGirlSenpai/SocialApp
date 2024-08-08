import express from 'express';
import { getConnection } from '../config/db.js'; 
import redisClient from '../config/redis.js'; 

const router = express.Router();

// API endpoint to get user profile data
router.get('/users/:uid', async (req, res) => {
    let connection;
    const cacheKey = `user:${req.params.uid}`;
    try {
        connection = await getConnection();
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit');
            return res.status(200).json(JSON.parse(cachedData));
        }
        const uid = req.params.uid;
        const [rows] = await connection.query(
            'SELECT uid, authprovider, email, display_name, photo_url, country, region, username, phone_number, address, date_of_birth, description, created_at FROM users WHERE uid = ?', 
            [uid]
        );
        if (rows.length > 0) {
            await redisClient.set(cacheKey, JSON.stringify(rows), 'EX', 3600); 
            res.status(200).json(rows);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
});

// API endpoint to store init user data
router.post('/users', async (req, res) => {
    let connection;
    try {
        const { uid, providerData, email, displayName, photoURL } = req.body;

        connection = await getConnection();
        const [results] = await connection.query('SELECT COUNT(*) AS count FROM users WHERE uid = ?', [uid]);
        const userCount = results[0].count;

        if (userCount > 0) {
            console.log('User already exists!');
            res.status(200).json({ message: 'User already exists' });
        } else {
            await connection.query(
                'INSERT INTO users (uid, authprovider, email, display_name, photo_url) VALUES (?, ?, ?, ?, ?)',
                [uid, providerData?.[0]?.providerId, email, displayName, photoURL]
            );
            console.log('User data saved');
            res.status(201).json({ success: true, message: 'User data saved' });
        }
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    } finally {
        if (connection) connection.release();
    }
});

// API endpoint to update user profile data
router.put('/users/update', async (req, res) => {
    let connection;
    try {
        const { uid, username, email, date_of_birth, address, country, region, phone_number, description } = req.body;

        connection = await getConnection();
        const [results] = await connection.query('SELECT COUNT(*) AS count FROM users WHERE uid = ?', [uid]);
        const userCount = results[0].count;

        if (userCount === 1) {
            const updateQuery = `
                UPDATE users 
                SET username = ?, email = ?, date_of_birth = ?, address = ?, country = ?, region = ?, phone_number = ?, description = ? 
                WHERE uid = ?
            `;
            await connection.query(updateQuery, [username, email, date_of_birth, address, country, region, phone_number, description, uid]);
            console.log('User data updated');
            res.status(200).json({ success: true, message: 'User data updated' });
        } else {
            console.log('User not found');
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    } finally {
        if (connection) connection.release();
    }
});

export default router;
