import { getConnection } from '../config/db.js';

export const update = async (req, res) => {    
    let connection;
    try {
        connection = await getConnection();
        const receivedData = req.body;

        const { uid_transmitter, uid_receiver, status } = receivedData;
        if (!uid_transmitter || !uid_receiver || !status) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const updateQuery = 'UPDATE friendrequests SET status = ? WHERE uid_transmitter = ? AND uid_receiver = ?';
        const [result] = await connection.query(updateQuery, [status, uid_transmitter, uid_receiver]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Friend request not found' });
        }

        res.status(200).json({ success: true, message: 'Friend request updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

export const store = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let receivedData = req.body;
        let friendrequestData = JSON.parse(receivedData.body);
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
                res.status(200).json({ success: true, message: 'Friend request status updated to pending' });
            } else {
                res.status(200).json({ success: false, message: 'Friend request already exists' });
            }
        } else {
            let insertQuery = `
                INSERT INTO friendrequests (uid_transmitter, uid_receiver, status) 
                VALUES (?, ?, 'pending')
            `;
            await connection.query(insertQuery, [uid_transmitter, uid_receiver]);
            res.status(200).json({ success: true, message: 'Friend request sent' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to process data' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const getFriends = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let uid = req.params.uid;
        let [rows] = await connection.query('SELECT u.photo_url, u.username, u.uid FROM friendrequests AS f JOIN users AS u ON (f.uid_transmitter = u.uid OR f.uid_receiver = u.uid) WHERE ((f.uid_transmitter = ? OR f.uid_receiver = ?) AND f.status = ?) AND u.uid != ?', [uid, uid, 'accepted', uid]);
        res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
};