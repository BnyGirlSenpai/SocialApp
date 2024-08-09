import { getConnection } from '../config/db.js';

export const create  = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let receivedData = req.body;
        let eventData = JSON.parse(receivedData.body);
        try {
            const insertQuery = `
                INSERT INTO events 
                (event_name, location, event_datetime, description, max_guests_count, event_status, creator_uid, event_type, image_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await connection.query(insertQuery, [
                eventData.eventName, 
                eventData.location, 
                eventData.eventDateTime, 
                eventData.description, 
                eventData.maxGuests, 
                eventData.eventStatus, 
                eventData.uid, 
                eventData.eventType, 
                eventData.eventImage
            ]);
            const newEventId = result.insertId;
            res.status(200).json({ message: 'Event created successfully', eventId: newEventId });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
};

export const edit  = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let eid = req.params.eid;
        let [rows] = await connection.query('SELECT event_id, event_name, event_datetime, location, description, max_guests_count, event_status, event_type, image_url  FROM events WHERE event_id = ?', [eid]);
        res.status(200).json(rows); 
    } catch (error) {
        console.error('Error retrieving event data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const remove = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let eid = req.params.eid;
        let [result] = await connection.query('DELETE FROM events WHERE event_id = ?', [eid]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const update  = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let eventData = req.body;
        let eid = eventData[9]; 
        let selectQuery = 'SELECT COUNT(*) AS count FROM events WHERE event_id = ?';
        let [results] = await connection.query(selectQuery, [eid]);
        let eventCount = results[0].count;

        if (eventCount === 1) {
            let updateFields = [];
            let updateValues = [];
            updateFields.push('event_name = ?, location = ?, event_datetime = ?, description = ?, max_guests_count = ?, event_type = ?, image_url = ?, event_status = ?, updated_by_uid = ?'); 
            
            if (eventData.length === 10) { 
                updateValues = eventData.slice(0, 10);
                updateValues.push(eventData[10]); 
            } else {
                return res.status(400).json({ error: 'Invalid data format' });
            }
            updateValues.push(eid); 
            let updateQuery = `UPDATE events SET ${updateFields} WHERE event_id = ?`;

            await connection.query(updateQuery, updateValues);
            res.status(200).json({ success: true, message: 'Event data updated' });
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to process data' });
    }
    finally {
        connection.release(); 
    }
}