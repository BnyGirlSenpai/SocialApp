import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pool from './components/database.js';
import friendSystemApi from './components/friendSystemApi.js';
import userApi from './components/userApi.js';
import eventInviteApi from './components/eventInviteApi.js';
import searchApi from './components/searchApi.js';
import eventCreationApi from './components/eventCreationApi.js';
import eventInfoApi from './components/eventInfoApi.js';
import notificaionApi from './components/notificationsApi.js';
import itemListApi from './components/itemListApi.js';

dotenv.config();

const app = express(); 
const port = 3001;

let connection;
try {
    connection = await pool.getConnection();
} catch (error) {
    console.error('Error executing query:', error);
} finally {
    if (connection) {
        connection.release();
    }
}

setInterval(async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('Keep-alive query executed successfully');
    } catch (error) {
        console.error('Error in keep-alive query:', error);
    }
}, 60000); 

let limiter = rateLimit({
    windowMs: 60000, 
    max: 1000, 
    reset: 1630694271
});
  
app.use('/api/', limiter);
app.use(express.json());
app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://trusted.cdn.com"],
        styleSrc: ["'self'", "https://trusted.cdn.com"],
      },
    })
);

app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

app.use(helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
}));

app.use(express.static('build'));

app.use(cors({
    origin: ['http://localhost:3000','http://localhost:3000/EditItemListFormPage','http://localhost:3000/HomePage', 'http://localhost:3000/ProfileSettingsPage','http://localhost:3000/EventPage','http://localhost:3000/EditEventFormPage','http://localhost:3000/FriendPage','http://localhost:3000/NotificationPage'], // Allow requests from your frontend's origin
    credentials: true // Optional, to allow cookies if needed
}));

app.use('/api', friendSystemApi);
app.use('/api', userApi);
app.use('/api', eventInviteApi);
app.use('/api', searchApi);
app.use('/api', eventCreationApi);
app.use('/api', eventInfoApi);
app.use('/api', notificaionApi);
app.use('/api', itemListApi)

app.use((err, req, res, next) => {
    if (!err.statusCode) {
        err.statusCode = 500; 
    }
    res.status(err.statusCode).json({
        error: {
            status: err.statusCode,
            message: err.message
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

