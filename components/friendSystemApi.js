import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

// API endpoint to update pending friendrequests data
router.post('/users/update/friendrequests' ,async (req, res) => {
    let receivedData = req.body;
    console.log(receivedData);
    let { uid_transmitter, uid_receiver, status } = receivedData;
    try {
        connection = await pool.getConnection();
        await connection.query('UPDATE friendrequests SET status = ? WHERE uid_transmitter = ? AND uid_receiver = ?', [status, uid_transmitter, uid_receiver]);
        console.log(uid_receiver,uid_transmitter,status);
        res.status(200).json({ success: true, message: 'Friend request updated successfully' });
    } catch (error) {
        console.error('Error updating friend request:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// API endpoint to store and update pending friendrequests data
router.post('/users/friendrequests', async (req, res) => {
    let receivedData = req.body;
    let friendrequestData = JSON.parse(receivedData.body);
    console.log(friendrequestData);
    let uid_transmitter = friendrequestData.senderUserUid;
    let uid_receiver = friendrequestData.targetUserUid;

    let selectQuery = 'SELECT COUNT(*) AS count FROM friendrequests WHERE uid_transmitter = ? AND uid_receiver = ?';

    try {
        let [results] = await connection.query(selectQuery, [uid_transmitter, uid_receiver]);
        let userCount = results[0].count;

        if (userCount > 0) {
            let checkStatusQuery = 'SELECT status FROM friendrequests WHERE uid_transmitter = ? AND uid_receiver = ?';
            let [statusResults] = await connection.query(checkStatusQuery, [uid_transmitter, uid_receiver]);
            let status = statusResults[0].status;

            if (status === 'unfriended') {
                let updateStatusQuery = 'UPDATE friendrequests SET status = ? WHERE uid_transmitter = ? AND uid_receiver = ?';
                await connection.query(updateStatusQuery, ['pending', uid_transmitter, uid_receiver]);
                console.log('Friend request status updated to pending');
            } else {
                console.log('Friend request already exists');
            }
        } else {
            let insertQuery = 'INSERT INTO friendrequests (uid_transmitter, uid_receiver) VALUES (?, ?)';
            await connection.query(insertQuery, [uid_transmitter, uid_receiver]);
            console.log("User data saved");
        }
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
    finally {
        connection.release(); // Ensure connection is released in case of errors
    }
});

// API endpoint to get friends data
router.get('/users/friends/:uid', async (req, res) => {
    try {
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT u.photoUrl, u.username, u.uid FROM friendrequests AS f JOIN users AS u ON (f.uid_transmitter = u.uid OR f.uid_receiver = u.uid) WHERE ((f.uid_transmitter = ? OR f.uid_receiver = ?) AND f.status = ?) AND u.uid != ?', [uid, uid, 'accepted', uid]);
      res.status(200).json(rows);
      console.log(rows);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
