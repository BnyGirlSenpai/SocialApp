import { getConnection } from '../config/db.js';

export const pending = async (req, res) => {
    let connection;
    try {
      connection = await getConnection();
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT u.photo_url, u.username , u.uid, ur.created_at FROM friendrequests AS ur JOIN users AS u ON ur.uid_transmitter = u.uid WHERE ur.uid_receiver = ? AND ur.status = "pending"',[uid]);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
};