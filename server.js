import express from 'express';
import { createPool } from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 3001;
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

// Enable CORS for all routes
app.use(cors());

// MySQL connection pool
const pool = createPool({
  host: host,
  user: user,
  password: pw,
  database: dbname,
  connectionLimit: 10, // Adjust the limit based on your needs
});

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
