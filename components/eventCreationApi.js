import express from 'express';
import pool from './database.js';

const router = express.Router();
let connection = await pool.getConnection();

// API endpoint to create new event data
router.post('/event/create', async (req, res) => {
    let receivedData = req.body;
    let eventData =  JSON.parse(receivedData.body);
    console.log(eventData);
    try {
        let insertQuery = 'INSERT INTO events (event_name, location, event_datetime, description, max_guests_count, event_visibility, creator_uid) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await connection.query(insertQuery, [eventData.eventName, eventData.location, eventData.eventDateTime, eventData.description, eventData.maxGuests, eventData.eventVisibility, eventData.uid]);
        console.log("Event data saved");
        connection.release();
        res.status(200).json({ message: 'Event created successfully' });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// API endpoint to edited events 
router.get('/events/edit/:eid', async (req, res) => {
    try {
        let eid = req.params.eid;
        let [rows] = await connection.query('SELECT event_id, event_name, event_datetime, location, description, max_guests_count, event_visibility FROM events WHERE event_id = ?', [eid]);
        res.status(200).json(rows); 
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving event data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to delete event 
router.post('/events/edit/delete', async (req, res) => {
    try {
        let eventData = req.body;
        let eid = eventData[0]; 
        let [result] = await connection.query('DELETE FROM events WHERE event_id = ?', [eid]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
        console.log(`Event with ID ${eid} deleted successfully`);
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to store updated event data
router.post('/events/edit/update', async (req, res) => {
    console.log(req.body);
    let eventData = req.body;
    let eid = eventData[6]; 

    let selectQuery = 'SELECT COUNT(*) AS count FROM events WHERE event_id = ?';
    try {
        let connection = await pool.getConnection();
        let [results] = await connection.query(selectQuery, [eid]);
        let eventCount = results[0].count;

        if (eventCount === 1) {
            let updateFields = [];
            let updateValues = [];
            updateFields.push('event_name = ?, location = ?, event_datetime = ?, description = ?, max_guests_count = ?, event_visibility = ?'); 
            
            if (eventData.length === 7) { 
                updateValues = eventData.slice(0, 7);
                updateValues.push(eventData[7]); 
            } else {
                console.log('Invalid data format');
                return res.status(400).json({ error: 'Invalid data format' });
            }
            updateValues.push(eid); 
            let updateQuery = `UPDATE events SET ${updateFields} WHERE event_id = ?`;

            await connection.query(updateQuery, updateValues);
            console.log('Event data updated');
            res.status(200).json({ success: true, message: 'Event data updated' });
        } else {
            console.log('Event not found');
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
    finally {
        connection.release(); 
    }
})

export default router;