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

// API endpoint to get pending friendrequests notification
router.get('/users/friendrequests/:uid', async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT u.photo_url, u.username , u.uid, ur.created_at FROM friendrequests AS ur JOIN users AS u ON ur.uid_transmitter = u.uid WHERE ur.uid_receiver = ? AND ur.status = "pending"',[uid]);
      console.log(rows);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
