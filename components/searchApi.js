import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

// API endpoint to get user search data 
router.get('/users/search/:username', async (req, res) => {
    try {
      let username = req.params.username;
      console.log(username);
      let [rows] = await connection.query('SELECT uid, photo_url, username FROM users WHERE username LIKE CONCAT(\'%\', ?, \'%\')', [username]);
      if (rows.length > 0) {
        res.status(200).json(rows);
      } else {
        res.status(200).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
 export default router;