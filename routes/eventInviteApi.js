import express from 'express';
import { getConnection } from '../config/db.js';

const router = express.Router();

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

// Check if a event is joinable 
async function isEventJoinable(event_id, event_guests_id = null, connection) {

    const checkEventQuery = `
        SELECT event_status, current_guests_count, max_guests_count, creator_uid 
        FROM events 
        WHERE event_id = ?  
    `;
    const [eventRows] = await connection.query(checkEventQuery, [event_id]);
    const eventStatus = eventRows[0].event_status; 
    const currentGuests = eventRows[0].current_guests_count;
    const maxGuests = eventRows[0].max_guests_count;
    const statuses = eventStatus.split(','); 

    if (eventRows.length === 0) {
        console.log(`Event ${event_id} not found`);
        throw new Error('Event not found');
    }
    
    if(currentGuests === maxGuests){
        console.log(`Event ${event_id} is not joinable (status: ${eventStatus})`);
        throw new Error('Cannot join this event');
    }

    if (statuses.includes('public') && statuses.includes('open')){
        console.log(`Event ${event_id} is joinable`);
        return true; 
    } else {
            const checkInviteQuery = `
            SELECT invited_by_uid
            FROM event_guests 
            WHERE event_id = ? AND guest_uid = ?
        `
        const [inviteRows] = await connection.query(checkInviteQuery,[event_id,event_guests_id]); 
        const eventCreator = eventRows[0].creator_uid; 
        const inviter = inviteRows[0].invited_by_uid;
        console.log(`Event ${event_id} status: ${eventStatus}, Creator UID: ${eventCreator} Invite from: ${inviter}`);

        if (statuses.includes('public') && statuses.includes('closed') && eventCreator === inviter){
            console.log("public,closed",(inviter))
            console.log(`Event ${event_id} is joinable`);
            return true; 
        } 
        
        if (statuses.includes('private') && statuses.includes('closed') && eventCreator === inviter) {
            console.log(`Event ${event_id} is joinable`);
            console.log("privat,closed",(inviter))
            return true;
        } 

        if (statuses.includes('private') && statuses.includes('open')) {
            if (inviter != null) {
                console.log("privat,open",(inviter))
                console.log(`Event ${event_id} is joinable`);
                return true
            } else {
                console.log(`Event ${event_id} is not joinable (status: ${eventStatus})`);
                throw new Error('Cannot join this event');
            }
        } else {
            console.log(`Event ${event_id} is not joinable (status: ${eventStatus})`);
            throw new Error('Cannot join this event');
        } 
    } 
}

// API endpoint to store event invites uid's
router.post('/events/invites/:event_id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const event_id = req.params.event_id;
        const receivedData = JSON.parse(req.body.body);
        const invited_by_uid = receivedData.pop(); 
        const guestUIDs = receivedData;

        console.log("receivedData:", guestUIDs);
        console.log("invited_by_uid:", invited_by_uid);

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
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// API to update event database after invited guest interaction
router.put('/events/userStatus/update', async (req, res) => {
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
});

// API to join public events
router.put('/join/public/event', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const eventData = req.body;
        console.log(eventData);

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
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

export default router;