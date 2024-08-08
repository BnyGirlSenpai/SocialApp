import express from 'express';
import pool from './database.js';

const router = express.Router();
const getConnection = async () => {
    try {
        return await pool.getConnection();
    } catch (error) {
        throw new Error('Failed to get database connection');
    }
};

// API endpoint to edit and create Item Lists 
router.post('/events/itemlist/edit/:event_id',async (req, res) => {
    let connection;
    const items = JSON.parse(req.body.body);
    console.log("items:", items);

    if (!Array.isArray(items)) {
        console.error('Invalid items data:', items);
        return res.status(400).send({ error: 'Invalid items data' });
    }
    try {   
        connection = await getConnection();       
        items.forEach(async (item) => {
            const { Label, Count, min_count, max_count } = item;

            if (typeof Label !== 'string' || typeof Count !== 'number' ||
                typeof min_count !== 'number' || typeof max_count !== 'number') {
                throw new Error('Invalid item properties');
            }

            await connection.query(`
                INSERT INTO event_items (label, count, min_count, max_count, event_id) 
                VALUES (?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE count = VALUES(count), 
                                        max_count = VALUES(max_count), 
                                        min_count = VALUES(min_count)`,
                [Label, Count, min_count, max_count, req.params.event_id]
            );
        })
        res.status(200).send({ message: 'Items saved successfully' });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send({ error: error.message });
    }
});

// API endpoint to get Item Lists 
router.get('/events/itemlist/:event_id',async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let event_id = req.params.event_id;
        let [rows] = await connection.query(`
            SELECT label, count, max_count, min_count
            FROM event_items
            WHERE event_id = ?
        `, [event_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.status(200).json(rows);
        console.log(rows);
    } catch (error) {
        console.error('Error retrieving event details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to update Item Lists 
router.put('/events/itemlist/update/:event_id', async (req, res) => {
    console.log(req.body);
    let connection;
    try {
        connection = await getConnection();
        let event_id = req.params.event_id;
        let items = req.body; 

        for (let item of items) {
            let { label, count } = item; 

            let [result] = await connection.query(
                'UPDATE event_items SET count = ? WHERE event_id = ? AND label = ?',
                [count, event_id, label]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: `Event item with label ${label} not found` });
            }
        }

        res.status(200).json({ message: 'Item counts updated successfully' });
        console.log('Item counts updated successfully');
    } catch (error) {
        console.error('Error updating counts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to delete Item Lists 
router.delete('/events/itemslist/delete/:label/:event_id',async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        let event_id = req.params.event_id;
        let label = req.params.label;
        let [result] = await connection.query('DELETE FROM event_items WHERE event_id = ? AND label = ?', [event_id, label]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully' });
        console.log(`Item ${label} deleted successfully`);
    } catch (error) {
        console.error('Error deleting Item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to store user item distribution
router.post('/events/itemslist/add/count', async (req, res) => {
    let connection;
    const items = JSON.parse(req.body.body);
    console.log("items:", items);

    if (!Array.isArray(items)) {
        console.error('Invalid items data:', items);
        return res.status(400).send({ error: 'Invalid items data' });
    }
    try {   
        connection = await getConnection();       

        const itemGroups = {};
        for (const item of items) {
            const { uid, label, user_distributed_count } = item;

            if (typeof uid !== 'string' || typeof label !== 'string' ||
                typeof user_distributed_count !== 'number') {
                throw new Error('Invalid item properties');
            }

            const [rows] = await connection.query(`
                SELECT item_id, max_count
                FROM event_items
                WHERE label = ?;
            `, [label]);
            const item_id = rows.length > 0 ? rows[0].item_id : null; 
            const max_count = rows.length > 0 ? rows[0].max_count : null; 
            console.log('item_id:', item_id, 'max_count:', max_count);

            if (!item_id) {
                throw new Error(`Item with label ${label} not found`);
            }

            if (!itemGroups[item_id]) {
                itemGroups[item_id] = { totalDistributedCount: 0, maxCount: max_count };
            }
            itemGroups[item_id].totalDistributedCount += user_distributed_count;

            if (itemGroups[item_id].totalDistributedCount > itemGroups[item_id].maxCount) {
                throw new Error(`Total distributed count for item_id ${item_id} exceeds max_count`);
            }
        }

        for (const item of items) {
            const { uid, label, user_distributed_count } = item;
            
            const [rows] = await connection.query(`
                SELECT item_id
                FROM event_items
                WHERE label = ?;
            `, [label]);
            const item_id = rows.length > 0 ? rows[0].item_id : null; 

            await connection.query(`
                INSERT INTO user_item_distribution (uid, item_id, distributed_count)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE distributed_count = VALUES(distributed_count);
            `, [uid, item_id, user_distributed_count]);
        }

        res.status(200).send({ message: 'Items saved successfully' });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send({ error: error.message });
    }
});

// API endpoint to get user item distribution
router.get('/events/itemslist/get/count/:uid/:event_id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const event_id = req.params.event_id;
        const uid = req.params.uid;
        const [results] = await connection.query(`
            SELECT e.label, COALESCE(u.distributed_count, 0) AS user_item_count
            FROM event_items e
            LEFT JOIN user_item_distribution u ON e.item_id = u.item_id 
            WHERE e.event_id = ? AND u.uid = ?
            GROUP BY e.item_id;
        `, [event_id, uid]);
        
        res.status(200).json(results);
        console.log(results);
    } catch (error) {
        console.error('Error retrieving user item distribution:', error);
        res.status(500).json({ error: 'An error occurred while retrieving user item distribution' });
    } finally {
        if (connection) {
            connection.release(); 
        }
    }
});

export default router;
