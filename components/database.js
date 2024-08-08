import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
requiredEnv.forEach(envVar => {
    if (!process.env[envVar]) {
        throw new Error(`Environment variable ${envVar} is missing`);
    }
});

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 100,  
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 100,          
    enableKeepAlive: true,
    keepAliveInitialDelay: parseInt(process.env.DB_KEEPALIVE_DELAY) || 0,
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 60000,       
});

pool.on('connection', (connection) => {
    console.log(`New connection made with ID: ${connection.threadId}`);
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

export default pool;
