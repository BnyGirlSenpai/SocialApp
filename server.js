import express from 'express';
import { createPool} from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3001;
const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
const connection = await pool.getConnection();

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3000/ProfileSettingsPage','http://localhost:3000/FriendPage','http://localhost:3000/NotificationPage'], // Allow requests from your frontend's origin
    credentials: true // Optional, to allow cookies if needed
}));

// Define the main function for fetching data from the Ticketmaster API
/*
async function fetchEventData() {
    const page = 3;
    const classificationName = 'music';
    const countryCode = 'DE';
    const city = 'Cologne';
    const apikey = process.env.API_KEY; //missing in .env
    const size = 4;

    const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=${encodeURIComponent(classificationName)}&countryCode=${encodeURIComponent(countryCode)}&city=${encodeURIComponent(city)}&apikey=${encodeURIComponent(apikey)}&size=${size}&page=${page}`;

    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching events from Ticketmaster API:', error);
        throw error;
    }
}

// API endpoint to get events from the Ticketmaster API
app.get('/api/events', async (req, res) => {
    try {
        const eventData = await fetchEventData();
        res.json(eventData);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
*/  

//----------------------Friend System Endpoints-----------------------------//

// API endpoint to get pending friendrequests data
app.get('/api/users/friendrequests/:uid', async (req, res) => {
    try {
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT u.photoUrl, u.username , u.uid FROM friendrequests AS ur JOIN users AS u ON ur.uid_transmitter = u.uid WHERE ur.uid_receiver = ? AND ur.status = "pending"',[uid]);
      console.log(rows);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to update pending friendrequests data
app.post('/api/users/update/friendrequests' ,async (req, res) => {
    let receivedData = req.body;
    console.log(receivedData);
    let uid_transmitter = receivedData.uid_transmitter;
    let uid_receiver= receivedData.uid_receiver;
    let status = receivedData.status;
    try {
        await connection.query('UPDATE friendrequests SET status = ? WHERE uid_transmitter = ? AND uid_receiver = ?', [status, uid_transmitter, uid_receiver]);
        console.log(uid_receiver,uid_transmitter,status);
        res.status(200).json({ success: true, message: 'Friend request updated successfully' });
    } catch (error) {
        console.error('Error updating friend request:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// API endpoint to store and update pending friendrequests data
app.post('/api/users/friendrequests', async (req, res) => {
    let receivedData = req.body;
    let friendrequestData = JSON.parse(receivedData.body);
    console.log(friendrequestData);
    let uid_transmitter = friendrequestData.senderUserUid;
    let uid_receiver = friendrequestData.targetUserUid;

    let selectQuery = 'SELECT COUNT(*) AS count FROM friendrequests WHERE uid_transmitter = ? AND uid_receiver = ?';

    try {
        let [results] = await connection.query(selectQuery, [uid_transmitter, uid_receiver]);
        let userCount = results[0].count;

        if (userCount > 0) {
            let checkStatusQuery = 'SELECT status FROM friendrequests WHERE uid_transmitter = ? AND uid_receiver = ?';
            let [statusResults] = await connection.query(checkStatusQuery, [uid_transmitter, uid_receiver]);
            let status = statusResults[0].status;

            if (status === 'unfriended') {
                let updateStatusQuery = 'UPDATE friendrequests SET status = ? WHERE uid_transmitter = ? AND uid_receiver = ?';
                await connection.query(updateStatusQuery, ['pending', uid_transmitter, uid_receiver]);
                console.log('Friend request status updated to pending');
            } else {
                console.log('Friend request already exists');
            }
        } else {
            let insertQuery = 'INSERT INTO friendrequests (uid_transmitter, uid_receiver) VALUES (?, ?)';
            await connection.query(insertQuery, [uid_transmitter, uid_receiver]);
            console.log("User data saved");
        }
        connection.release();
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// API endpoint to get friends data
app.get('/api/users/friends/:uid', async (req, res) => {
    try {
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT u.photoUrl, u.username, u.uid FROM friendrequests AS f JOIN users AS u ON (f.uid_transmitter = u.uid OR f.uid_receiver = u.uid) WHERE ((f.uid_transmitter = ? OR f.uid_receiver = ?) AND f.status = ?) AND u.uid != ?', [uid, uid, 'accepted', uid]);
      res.status(200).json(rows);
      console.log(rows);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

//-------------------------User Endpoints----------------------------------//

// API endpoint to get user profile data
app.get('/api/users/:uid', async (req, res) => {
    try {
      let uid = req.params.uid;
      let [rows] = await connection.query('SELECT uid, authprovider, email, displayName, photoURL, country,region, username, phoneNumber, address, password, dateOfBirth, description FROM users WHERE uid = ?', [uid]);
      if (rows.length > 0) {
        res.status(200).json(rows);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to store init user data
app.post('/api/users', async (req, res) => {
    let receivedData = req.body;
    let userData = JSON.parse(receivedData.body);
    let providerData = userData.providerData;
    let uid = userData.uid;
    let selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE uid = ?';

    try {
        let [results] = await connection.query(selectQuery, [uid]);
        let userCount = results[0].count;

        if (userCount > 0) {      
            console.log('User already exists!');
        } else {       
            let insertQuery = 'INSERT INTO users (uid, authprovider, email, displayName, photoURL) VALUES (?, ?, ?, ?, ?)';
            await connection.query(insertQuery, [uid, providerData?.[0]?.providerId, userData?.email, userData?.displayName, userData?.photoURL]);
            console.log("User data saved");
        }
        connection.release();
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// API endpoint to update user profile data
app.post('/api/users/update', async (req, res) => {
    console.log(req.body);
    let userData = req.body;
    let uid = userData[9]; 

    const selectQuery = 'SELECT COUNT(*) AS count FROM users WHERE uid = ?';
    try {
        let connection = await pool.getConnection();
        let [results] = await connection.query(selectQuery, [uid]);
        let userCount = results[0].count;

        if (userCount === 1) {
            let updateFields = [];
            let updateValues = [];
            updateFields.push('username = ?, email = ?, dateOfBirth = ?, password = ?, address = ?, country = ?, region = ?, phoneNumber = ?, description = ?'); 
            
            if (userData.length === 10) { 
                updateValues = userData.slice(0, 8);
                updateValues.push(userData[8]); 
            } else {
                console.log('Invalid data format');
                return res.status(400).json({ error: 'Invalid data format' });
            }
            updateValues.push(uid); 
            let updateQuery = `UPDATE users SET ${updateFields} WHERE uid = ?`;

            await connection.query(updateQuery, updateValues);
            console.log('User data updated');
            res.status(200).json({ success: true, message: 'User data updated' });
        } else {
            console.log('User not found');
            res.status(404).json({ error: 'User not found' });
        }
        connection.release();
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

//-------------------------Search Endpoints---------------------------------//

// API endpoint to get user search data 
app.get('/api/users/search/:username', async (req, res) => {
    try {
      let username = req.params.username;
      console.log(username);
      let [rows] = await connection.query('SELECT uid, photoURL, username FROM users WHERE username LIKE CONCAT(\'%\', ?, \'%\')', [username]);
      if (rows.length > 0) {
        res.status(200).json(rows);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

//-------------------------Event Endpoints---------------------------------//

// API endpoint to create new event data
app.post('/api/event/create', async (req, res) => {
    let receivedData = req.body;
    let eventData =  JSON.parse(receivedData.body);
    let eventDate = new Date(eventData.eventDate).toISOString().slice(0, 10); 
    let eventTime = eventData.eventTime; 
    console.log(eventData);
    
    try {
        let insertQuery = 'INSERT INTO events (event_name, location, event_date, description, max_guests_count, event_time, creator_uid) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await connection.query(insertQuery, [eventData.eventName, eventData.location, eventDate, eventData.description, eventData.maxGuests, eventTime, eventData.uid]);
        console.log("Event data saved");
        connection.release();
        res.status(200).json({ message: 'Event created successfully' });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// API endpoint to get curent user event data
app.get('/api/events/:uid', async (req, res) => {
    try {
        let uid = req.params.uid;
        let [rows] = await connection.query('SELECT event_id, event_name, event_date, event_time, location, description, max_guests_count, current_guests_count, invited_guests_count, creator_uid FROM events WHERE creator_uid = ?', [uid]);
        res.status(200).json(rows); 
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving event data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API to update event database after invited_guest interaction
app.post('/api/events/update/', async (req, res) => {
    try {
        const receivedData = req.body;
        console.log('Received data:', receivedData);
        const uid_guest = receivedData.uid_guest;
        const event_id = receivedData.event_id;
        const status = receivedData.status;

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
                    invited_guests = JSON_REMOVE(
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
                                    )
                WHERE event_id = ?
            `, [uid_guest, uid_guest, event_id]);

            // Update counts
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

async function updateCounts(event_id, connection) {
    const [guestCounts] = await connection.query(`
        SELECT 
            JSON_LENGTH(IFNULL(joined_guests, '[]')) AS joined_count,
            JSON_LENGTH(IFNULL(declined_invites, '[]')) AS declined_count
        FROM events
        WHERE event_id = ?;
    `, [event_id]);

    const joinedCount = guestCounts[0].joined_count;
    const declinedCount = guestCounts[0].declined_count;

    await connection.query(`
        UPDATE events
        SET current_guests_count = ?,
            declined_invites_count = ?
        WHERE event_id = ?;
    `, [joinedCount, declinedCount, event_id]);
}

// API endpoint to store event invites uid's
app.post('/api/events/invites/:eventId', async (req, res) => {
    console.log(req.body);
    let eventId = req.params.eventId;
    let receivedData = JSON.parse(req.body.body); 
    const selectQuery = 'SELECT invited_guests FROM events WHERE event_id = ?';

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

        connection.release();
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// API endpoint to get events the current user is an invited guest
app.get('/api/events/invited/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const [rows] = await connection.query(`
            SELECT e.event_id, e.event_name, e.creator_uid, u.username AS creator_username
            FROM events AS e
            JOIN users AS u ON e.creator_uid = u.uid
            WHERE JSON_CONTAINS(e.invited_guests, ?)
        `, [`{"uid":"${uid}"}`, '$']);

        res.status(200).json(rows);
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving invited events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//-------------------------Start the server---------------------------------//

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

