import { getConnection } from '../config/db.js';

export const create = async (req, res) => {
    let connection;
    const items = JSON.parse(req.body.body);

    if (!Array.isArray(items)) {
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
        res.status(500).send({ error: error.message });
    }
};

export const getItemList = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const update = async (req, res) => {
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
};

export const remove = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserItemDistribution = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving user item distribution' });
    } finally {
        if (connection) {
            connection.release(); 
        }
    }
};

export const saveUserItemDistribution = async (req, res) => {
    let connection;
    const items = JSON.parse(req.body.body);

    if (!Array.isArray(items)) {
        console.error('Invalid items data:', items);
        return res.status(400).send({ error: 'Invalid items data' });
    }
    try {   
        connection = await getConnection();       
        items.forEach(async (item) => {
            const { uid, label, user_distributed_count } = item;

            if (typeof uid !== 'string' || typeof label !== 'string' ||
                typeof user_distributed_count !== 'number') {
                throw new Error('Invalid item properties');
            }

            const [rows] = await connection.query(`
                SELECT item_id, max_count , count 
                FROM event_items
                WHERE label = ?;
            `, [label]);
            
            const item_id = rows.length > 0 ? rows[0].item_id : null; 
            const max_count = rows.length > 0 ? rows[0].max_count : null; 
            const count = rows.length > 0 ? rows[0].count : null; 

            if (user_distributed_count + count > max_count) {
                console.error(`Skipping item with label ${label} for user ${uid} as it exceeds max_count`);
                return;
            }

            await connection.query(`
                INSERT INTO user_item_distribution (uid, item_id, distributed_count)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE distributed_count = VALUES(distributed_count);
            `, [uid, item_id, user_distributed_count]);
        })
        res.status(200).send({ message: 'Items saved successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};