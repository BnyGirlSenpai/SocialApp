import { getConnection } from '../config/db.js';
import { updateJoinedGuestsCounts, updateInvitedGuestsCounts, isEventJoinable } from '../utils/eventUtility.js';

export const invites = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const event_id = req.params.event_id;
        const receivedData = JSON.parse(req.body.body);
        const invited_by_uid = receivedData.pop(); 
        const guestUIDs = receivedData;

        const checkQuery = `
            SELECT guest_uid 
            FROM event_guests 
            WHERE event_id = ? AND guest_uid = ? AND status = 'invited'
        `;

        const insertOrUpdateQuery = `
            INSERT INTO event_guests (event_id, guest_uid, status, invited_by_uid)
            VALUES (?, ?, ? ,?)
            ON DUPLICATE KEY UPDATE status = VALUES(status) , invited_by_uid = VALUES(invited_by_uid)
        `;
        
        for (const uid of guestUIDs) {
            const [existingInvitation] = await connection.query(checkQuery, [event_id, uid]);

            if (existingInvitation.length > 0) {
                await connection.query(insertOrUpdateQuery, [event_id, uid, 'invited',invited_by_uid]);
            } else {
                await connection.query(insertOrUpdateQuery, [event_id, uid, 'invited',invited_by_uid]);
            }
        }

        await updateInvitedGuestsCounts(event_id, connection);
        res.status(200).json({ success: true, message: 'Event data updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process data' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const userStatusUpdate = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const receivedData = req.body;
        console.log('Received data:', receivedData);
        const { uid_guest, event_id, status } = receivedData;

        await connection.beginTransaction();

        if (status === 'accepted') {  
            try {
                await isEventJoinable(receivedData.event_id,receivedData.uid_guest, connection);
            } catch (error) {
                if (error.message === 'Event not found') {
                    return res.status(404).json({ error: 'Event not found' });
                }
                if (error.message === 'Cannot join this event') {
                    return res.status(403).json({ error: 'Cannot join this event' });
                }
                throw error;
            }
            await connection.query(`
                UPDATE event_guests
                SET status = 'joined'
                WHERE guest_uid = ? AND event_id = ?
            `, [uid_guest, event_id]);
        } else if (status === 'declined') {
            await connection.query(`
                UPDATE event_guests
                SET status = 'declined'
                WHERE guest_uid = ? AND event_id = ?
            `, [uid_guest, event_id]);
        } else if (status === 'left') {
            await connection.query(`
                UPDATE event_guests
                SET status = 'left'
                WHERE guest_uid = ? AND event_id = ?
            `, [uid_guest, event_id]);
        } else {
            throw new Error('Invalid status value');
        }

        await updateJoinedGuestsCounts(event_id, connection);
        await connection.commit();
        res.status(200).json({ success: true, message: 'Event data updated successfully' });
    } catch (error) {
        console.error('Error updating event data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });

    } finally {
        connection.release(); 
    }
};

export const joinPublic = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const eventData = req.body;
        try {
            try {
                await isEventJoinable(eventData.event_id, eventData.uid_guest, connection);
            } catch (error) {
                if (error.message === 'Event not found') {
                    return res.status(404).json({ error: 'Event not found' });
                }
                if (error.message === 'Cannot join this event') {
                    return res.status(403).json({ error: 'Cannot join this event' });
                }
                throw error;
            }

            const checkUserQuery = `
                SELECT status 
                FROM event_guests 
                WHERE event_id = ? AND guest_uid = ?
            `;
            const [rows] = await connection.query(checkUserQuery, [eventData.event_id, eventData.uid_guest]);

            if (rows.length > 0) {
                const currentStatus = rows[0].status;
                if (currentStatus === 'left' || currentStatus === 'invited') {
                    const updateStatusQuery = `
                        UPDATE event_guests 
                        SET status = 'joined' , invited_by_uid = NULL
                        WHERE event_id = ? AND guest_uid = ?
                    `;
                    await connection.query(updateStatusQuery, [eventData.event_id, eventData.uid_guest]);
                }
            } else {
                const insertGuestQuery = `
                    INSERT INTO event_guests (event_id, guest_uid, status) 
                    VALUES (?, ?, 'joined')
                `;
                await connection.query(insertGuestQuery, [eventData.event_id, eventData.uid_guest]);
            }
            await updateJoinedGuestsCounts(eventData.event_id, connection);
            res.status(200).json({ message: 'Event joined successfully' });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to process data' });
    }
};