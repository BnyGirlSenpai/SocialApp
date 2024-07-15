import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

// Update User Counters
async function updateCounts(event_id, connection) {
    let [guestCounts] = await connection.query(`
        SELECT 
            JSON_LENGTH(IFNULL(joined_guests, '[]')) AS joined_count,
            JSON_LENGTH(IFNULL(declined_invites, '[]')) AS declined_count
        FROM events
        WHERE event_id = ?;
    `, [event_id]);

    let joinedCount = guestCounts[0].joined_count;
    let declinedCount = guestCounts[0].declined_count;

    await connection.query(`
        UPDATE events
        SET current_guests_count = ?,
            declined_invites_count = ?
        WHERE event_id = ?;
    `, [joinedCount, declinedCount, event_id]);
}

// API endpoint to store event invites uid's
router.post('/events/invites/:eventId', async (req, res) => {
    console.log(req.body);
    let eventId = req.params.eventId;
    let receivedData = JSON.parse(req.body.body); 
    let selectQuery = 'SELECT invited_guests FROM events WHERE event_id = ?';

    try {
        let connection = await pool.getConnection();
        let [results] = await connection.query(selectQuery, [eventId]);
        let invitedGuests = results[0].invited_guests ? JSON.parse(results[0].invited_guests) : [];

        async function updateInvitedGuestsCount(eventId) {
            let [event] = await connection.query('SELECT invited_guests FROM events WHERE event_id = ?', [eventId]);
            let invitedGuests = event[0].invited_guests ? JSON.parse(event[0].invited_guests) : [];
            let invitedGuestsCount = invitedGuests.length;
            await connection.query('UPDATE events SET invited_guests_count = ? WHERE event_id = ?', [invitedGuestsCount, eventId]);
        }

        async function mergeInvites(existingInvites, newInvites) {
            let mergedInvites = Array.isArray(existingInvites) ? [...existingInvites] : [];

            if (!Array.isArray(newInvites)) {
                console.error('New invites data is not in the expected format.');
                return mergedInvites;
            }

            if (mergedInvites.length === 0) {
                mergedInvites = await Promise.all(newInvites.map(async receivedData => {
                    let [userInfo] = await connection.query('SELECT uid FROM users WHERE uid = ?', [receivedData]);
                    return userInfo[0]; 
                }));
                return mergedInvites;
            }

            for (let newInvite of newInvites) {
                if (existingInvites.some(invite => invite.uid === newInvite)) {
                    console.log(`User with ID ${newInvite} is already invited.`);
                    continue; 
                }
                let [userInfo] = await connection.query('SELECT uid FROM users WHERE uid = ?', [newInvite]);
                mergedInvites.push(userInfo[0]);
            }
            return mergedInvites;
        }

        let mergedInvites = await mergeInvites(invitedGuests, receivedData);

        // Update the events table with the updated invited guests list
        let updateFields = ['invited_guests = ?'];
        let updateValues = [JSON.stringify(mergedInvites)];
        updateValues.push(eventId);

        let updateQuery = `UPDATE events SET ${updateFields.join(', ')} WHERE event_id = ?`;

        await connection.query(updateQuery, updateValues);
        console.log('Event data updated');

        await updateInvitedGuestsCount(eventId);

        res.status(200).json({ success: true, message: 'Event data updated' });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
    finally {
        connection.release(); 
    }
});

// API to update event database after invited_guest interaction
router.post('/events/update', async (req, res) => {
    try {
        let receivedData = req.body;
        console.log('Received data:', receivedData);
        let uid_guest = receivedData.uid_guest;
        let event_id = receivedData.event_id;
        let status = receivedData.status;

        if (status === 'accepted') {
            await connection.beginTransaction();

            await connection.query(`
                UPDATE events
                SET joined_guests = JSON_ARRAY_APPEND(
                                        IFNULL(joined_guests, '[]'),
                                        '$',
                                        JSON_OBJECT('uid', ?)
                                    ),
                    invited_guests = IF(
                                        JSON_LENGTH(IFNULL(invited_guests, '[]')) > 1,
                                        JSON_REMOVE(
                                            IFNULL(invited_guests, '[]'),
                                            JSON_UNQUOTE(
                                                JSON_SEARCH(
                                                    IFNULL(invited_guests, '[]'),
                                                    'one',
                                                    ?,
                                                    NULL,
                                                    '$[*].uid'
                                                )
                                            )
                                        ),
                                        '[]'
                                    )
                WHERE event_id = ?;            
            `, [uid_guest, uid_guest, event_id]);

            await updateCounts(event_id, connection);

            await connection.commit();

        } else if (status === 'declined') {
            await connection.beginTransaction();

            await connection.query(`
                UPDATE events
                SET declined_invites = JSON_ARRAY_APPEND(
                                            IFNULL(declined_invites, '[]'),
                                            '$',
                                            JSON_OBJECT('uid', ?)
                                        ),
                    invited_guests = IF(
                                        JSON_LENGTH(IFNULL(invited_guests, '[]')) > 1,
                                        JSON_REMOVE(
                                            IFNULL(invited_guests, '[]'),
                                            JSON_UNQUOTE(
                                                JSON_SEARCH(
                                                    IFNULL(invited_guests, '[]'),
                                                    'one',
                                                    ?,
                                                    NULL,
                                                    '$[*].uid'
                                                )
                                            )
                                        ),
                                        '[]'
                                    )
                WHERE event_id = ?;           
            `, [uid_guest, uid_guest, event_id]);

            // Update counts
            await updateCounts(event_id, connection);

            await connection.commit();

        } else if (status === 'left'){
            await connection.beginTransaction();

            await connection.query(`
            UPDATE events
            SET left_guests = JSON_ARRAY_APPEND(
                                        IFNULL(left_guests, '[]'),
                                        '$',
                                        JSON_OBJECT('uid', ?)
                                    ),
                joined_guests =  IF(
                                    JSON_LENGTH(IFNULL(invited_guests, '[]')) > 1,
                                    JSON_REMOVE(
                                        IFNULL(invited_guests, '[]'),
                                        JSON_UNQUOTE(
                                            JSON_SEARCH(
                                                IFNULL(invited_guests, '[]'),
                                                'one',
                                                ?,
                                                NULL,
                                                '$[*].uid'
                                            )
                                        )
                                    ),
                                    '[]'
                                )
                WHERE event_id = ?;           
            `, [uid_guest, uid_guest, event_id]);
            await updateCounts(event_id, connection);

            await connection.commit();
        }

        res.status(200).json({ success: true, message: 'Event data updated successfully' });
    } catch (error) {
        console.error('Error updating event data:', error);
        await connection.rollback();
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    } finally {
        connection.release();
    }
});

// API to join public events
router.post('/join/public/event', async (req, res) => {
    let receivedData = req.body;
    let uid_guest = receivedData.uid_guest;
    let event_id = receivedData.event_id;
    console.log('Received data:', receivedData);

    try {
        await connection.beginTransaction();

        await connection.query(`
            UPDATE events
            SET joined_guests = JSON_ARRAY_APPEND(
                                    IFNULL(joined_guests, '[]'),
                                    '$',
                                    JSON_OBJECT('uid', ?)
                                ),
                invited_guests = IF(
                                    JSON_LENGTH(IFNULL(invited_guests, '[]')) > 1,
                                    JSON_REMOVE(
                                        IFNULL(invited_guests, '[]'),
                                        JSON_UNQUOTE(
                                            JSON_SEARCH(
                                                IFNULL(invited_guests, '[]'),
                                                'one',
                                                ?,
                                                NULL,
                                                '$[*].uid'
                                            )
                                        )
                                    ),
                                    '[]'
                                )
            WHERE event_id = ?;
        `, [uid_guest, uid_guest, event_id]);

        await updateCounts(event_id, connection);

        await connection.commit();
        
        res.status(200).send({ success: true, message: 'Guest joined the event successfully' });
    } catch (error) {
        console.error('Error joining event:', error);
        await connection.rollback();
        res.status(500).send({ success: false, message: 'An error occurred while joining the event' });
    }
});


export default router;