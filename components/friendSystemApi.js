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

// API endpoint to update pending friendrequests data
router.put('/users/update/friendrequests', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const receivedData = req.body;
        console.log(receivedData);

        const { uid_transmitter, uid_receiver, status } = receivedData;
        if (!uid_transmitter || !uid_receiver || !status) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const updateQuery = 'UPDATE friendrequests SET status = ? WHERE uid_transmitter = ? AND uid_receiver = ?';
        const [result] = await connection.query(updateQuery, [status, uid_transmitter, uid_receiver]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Friend request not found' });
        }

        console.log(`Friend request updated: ${uid_transmitter} -> ${uid_receiver} Status: ${status}`);
        res.status(200).json({ success: true, message: 'Friend request updated successfully' });
    } catch (error) {
        console.error('Error updating friend request:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// API endpoint to store pending friendrequests 
router.post('/users/friendrequests', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let receivedData = req.body;
        let friendrequestData = JSON.parse(receivedData.body);
        console.log(friendrequestData);
        let uid_transmitter = friendrequestData.senderUserUid;
        let uid_receiver = friendrequestData.targetUserUid;

        let checkQuery = `
            SELECT status 
            FROM friendrequests 
            WHERE uid_transmitter = ? AND uid_receiver = ?
        `;
        const [rows] = await connection.query(checkQuery, [uid_transmitter, uid_receiver]);

        if (rows.length > 0) {
            let status = rows[0].status;
            if (status === 'unfriended') {
                let updateStatusQuery = `
                    UPDATE friendrequests 
                    SET status = 'pending' 
                    WHERE uid_transmitter = ? AND uid_receiver = ?
                `;
                await connection.query(updateStatusQuery, [uid_transmitter, uid_receiver]);
                console.log('Friend request status updated to pending');
                res.status(200).json({ success: true, message: 'Friend request status updated to pending' });
            } else {
                console.log("Friend request already exists");
                res.status(200).json({ success: false, message: 'Friend request already exists' });
            }
        } else {
            let insertQuery = `
                INSERT INTO friendrequests (uid_transmitter, uid_receiver, status) 
                VALUES (?, ?, 'pending')
            `;
            await connection.query(insertQuery, [uid_transmitter, uid_receiver]);
            console.log("Friend request saved");
            res.status(200).json({ success: true, message: 'Friend request sent' });
        }
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// API endpoint to get friends data
router.get('/users/friends/:uid', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT u.photo_url, u.username, u.uid FROM friendrequests AS f JOIN users AS u ON (f.uid_transmitter = u.uid OR f.uid_receiver = u.uid) WHERE ((f.uid_transmitter = ? OR f.uid_receiver = ?) AND f.status = ?) AND u.uid != ?', [uid, uid, 'accepted', uid]);
      res.status(200).json(rows);
      console.log(rows);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
