import { getConnection } from '../config/db.js';

export const searchUsers = async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      let username = req.params.username;
      let [rows] = await connection.query('SELECT uid, photo_url, username FROM users WHERE username LIKE CONCAT(\'%\', ?, \'%\')', [username]);
      if (rows.length > 0) {
        res.status(200).json(rows);
      } else {
        res.status(200).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
};