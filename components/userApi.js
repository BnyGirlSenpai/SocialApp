import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

// API endpoint to get user profile data
router.get('/users/:uid', async (req, res) => {
    try {
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT uid, authprovider, email, displayName, photoURL, country,region, username, phoneNumber, address, password, dateOfBirth, description FROM users WHERE uid = ?', [uid]);
      if (rows.length > 0) {
        res.status(200).json(rows);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to store init user data
router.post('/users', async (req, res) => {
    let receivedData = req.body;
    let userData = JSON.parse(receivedData.body);
    let providerData = userData.providerData;
    let uid = userData.uid;
    let selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE uid = ?';

    try {
        let [results] = await connection.query(selectQuery, [uid]);
        let userCount = results[0].count;

        if (userCount > 0) {      
            console.log('User already exists!');
        } else {       
            let insertQuery = 'INSERT INTO users (uid, authprovider, email, displayName, photoURL) VALUES (?, ?, ?, ?, ?)';
            await connection.query(insertQuery, [uid, providerData?.[0]?.providerId, userData?.email, userData?.displayName, userData?.photoURL]);
            console.log("User data saved");
        }
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
    finally {
        connection.release();
    }
});

// API endpoint to update user profile data
router.post('/users/update', async (req, res) => {
    console.log(req.body);
    let userData = req.body;
    let uid = userData[9]; 

    let selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE uid = ?';
    try {
        let connection = await pool.getConnection();
        let [results] = await connection.query(selectQuery, [uid]);
        let userCount = results[0].count;

        if (userCount === 1) {
            let updateFields = [];
            let updateValues = [];
            updateFields.push('username = ?, email = ?, dateOfBirth = ?, password = ?, address = ?, country = ?, region = ?, phoneNumber = ?, description = ?'); 
            
            if (userData.length === 10) { 
                updateValues = userData.slice(0, 8);
                updateValues.push(userData[8]); 
            } else {
                console.log('Invalid data format');
                return res.status(400).json({ error: 'Invalid data format' });
            }
            updateValues.push(uid); 
            let updateQuery = `UPDATE users SET ${updateFields} WHERE uid = ?`;

            await connection.query(updateQuery, updateValues);
            console.log('User data updated');
            res.status(200).json({ success: true, message: 'User data updated' });
        } else {
            console.log('User not found');
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
    finally {
        connection.release();
    }
});

export default router;
