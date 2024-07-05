import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

// API endpoint to get pending friendrequests notification
router.get('/users/friendrequests/:uid', async (req, res) => {
    try {
      let uid = req.params.uid;
      connection = await pool.getConnection();
      let [rows] = await connection.query('SELECT u.photoUrl, u.username , u.uid FROM friendrequests AS ur JOIN users AS u ON ur.uid_transmitter = u.uid WHERE ur.uid_receiver = ? AND ur.status = "pending"',[uid]);
      console.log(rows);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
