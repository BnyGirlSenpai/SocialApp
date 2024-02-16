import express from 'express';
import { createPool } from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// MySQL connection pool
const pool = createPool({
  host: 'Localhost',
  user: 'app',
  password: 'fiberline',
  database: 'app',
  connectionLimit: 10, // Adjust the limit based on your needs
});

// WorkDatabase('Localhost','app','fiberline','app');
// API endpoint to get titles from the database
app.get('/api/events', async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM Events');
      if (rows.length === 0) {
        res.status(404).json({ error: 'No events found' });
      } else {
        res.json(rows);
      }
    } catch (error) {
      console.error('Error fetching Events from the database:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
