import express from 'express';
import { getConnection } from '../config/db.js';
import redisClient from '../config/redis.js'; 

const router = express.Router();

// API endpoint to get pending friendrequests notification //no cache
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
