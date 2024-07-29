import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

// Update Joined Guests Counters
async function updateJoinedGuestsCounts(event_id, connection) {
    try {
        const countQuery = `
            SELECT COUNT(*) AS joined_count 
            FROM event_guests 
            WHERE event_id = ? AND status = 'joined'
        `;
        const [rows] = await connection.query(countQuery, [event_id]);
        
        const joinedCount = rows[0].joined_count;
        console.log(`Joined guests count for event_id ${event_id}: ${joinedCount}`);

        // Update the event with the new joined guests count
        const updateEventQuery = `
            UPDATE events 
            SET current_guests_count = ? 
            WHERE event_id = ?
        `;
        await connection.query(updateEventQuery, [joinedCount, event_id]);

        return joinedCount;
    } catch (error) {
        console.error('Error updating joined guests count:', error);
        throw error;
    }
}

// Update Invited Guests Counters
async function updateInvitedGuestsCounts(event_id, connection) {
    try {
        const countQuery = `
            SELECT COUNT(*) AS invited_count 
            FROM event_guests 
            WHERE event_id = ? AND status = 'invited'
        `;
        const [rows] = await connection.query(countQuery, [event_id]);
        
        const invitedCount = rows[0].invited_count;
        console.log(`Invited guests count for event_id ${event_id}: ${invitedCount}`);

        const updateEventQuery = `
            UPDATE events 
            SET invited_guests_count = ? 
            WHERE event_id = ?
        `;
        await connection.query(updateEventQuery, [invitedCount, event_id]);

        return invitedCount;
    } catch (error) {
        console.error('Error updating joined guests count:', error);
        throw error;
    }
}

// API endpoint to store event invites uid's
router.post('/events/invites/:eventId', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log(req.body);
        const eventId = req.params.eventId;
        const receivedData = JSON.parse(req.body.body);
        console.log(receivedData);

        const checkQuery = `
            SELECT guest_uid 
            FROM event_guests 
            WHERE event_id = ? AND guest_uid = ? AND status = 'invited'
        `;
        const insertOrUpdateQuery = `
            INSERT INTO event_guests (event_id, guest_uid, status)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status)
        `;
        
        for (const uid of receivedData) {
            // Check if the user is already invited
            const [existingInvitation] = await connection.query(checkQuery, [eventId, uid]);

            if (existingInvitation.length > 0) {
                // If the user is already invited, update their status
                await connection.query(insertOrUpdateQuery, [eventId, uid, 'invited']);
            } else {
                // If the user is not invited, insert a new record
                await connection.query(insertOrUpdateQuery, [eventId, uid, 'invited']);
            }
        }

        await updateInvitedGuestsCounts(eventId, connection);

        res.status(200).json({ success: true, message: 'Event data updated' });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// API to update event database after invited_guest interaction
router.put('/events/userStatus/update', async (req, res) => {
    const connection = await pool.getConnection(); 

    try {
        const receivedData = req.body;
        console.log('Received data:', receivedData);
        const { uid_guest, event_id, status } = receivedData;

        await connection.beginTransaction();

        if (status === 'accepted') {
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
});

// API to join public events
router.put('/join/public/event', async (req, res) => {
    try {
        const eventData = req.body;
        console.log(eventData);

        const connection = await pool.getConnection();
        try {
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
                        SET status = 'joined' 
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
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

export default router;