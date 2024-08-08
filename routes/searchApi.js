import express from 'express';
import { getConnection } from '../config/db.js';
import redisClient from '../config/redis.js'; 

const router = express.Router();

// API endpoint to get user search data 
router.get('/users/search/:username', async (req, res) => {
  let connection;
  const cacheKey = `username:${req.params.username}`;

    try {
      connection = await getConnection();
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log('Cache hit');
        return res.status(200).json(JSON.parse(cachedData));
      }
      let username = req.params.username;
      console.log(username);
      let [rows] = await connection.query('SELECT uid, photo_url, username FROM users WHERE username LIKE CONCAT(\'%\', ?, \'%\')', [username]);
      if (rows.length > 0) {
        await redisClient.set(cacheKey, JSON.stringify(rows), 'EX', 3600); 
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