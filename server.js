import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getConnection } from './config/db.js';
import compression from 'compression';
import morgan from 'morgan';
import friendSystemApi from './routes/friendSystemApi.js';
import userApi from './routes/userApi.js';
import eventInviteApi from './routes/eventInviteApi.js';
import searchApi from './routes/searchApi.js';
import eventCreationApi from './routes/eventCreationApi.js';
import eventInfoApi from './routes/eventInfoApi.js';
import notificaionApi from './routes/notificationsApi.js';
import itemListApi from './routes/itemListApi.js';
import calendarApi from './routes/calendarApi.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io'; 
//import redisClient from './config/redis.js'; 

dotenv.config();

const app = express();
const port = 3001; // in die dotenv!!!!
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

let connection;
try {
    connection = await getConnection();
} catch (error) {
    console.error('Error executing query:', error);
} finally {
    if (connection) {
        connection.release();
    }
}

let limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000 
});

app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(express.static('build', {
    maxAge: '1d',
    etag: false
}));
app.use(morgan('combined'));
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
app.use(cors({
    origin: ['http://localhost:3000','http://localhost:3000/EditItemListFormPage','http://localhost:3000/HomePage', 'http://localhost:3000/ProfileSettingsPage','http://localhost:3000/EventPage','http://localhost:3000/EditEventFormPage','http://localhost:3000/FriendPage','http://localhost:3000/NotificationPage','http://localhost:3000/OwnEventPage','http://localhost:3000/JoinedEventPage'], // Allow requests from your frontend's origin
    credentials: true // Optional, to allow cookies if needed
}));
app.use('/api/', limiter);
app.use('/api', asyncHandler(friendSystemApi));
app.use('/api', asyncHandler(userApi));
app.use('/api', asyncHandler(eventInviteApi));
app.use('/api', asyncHandler(searchApi));
app.use('/api', asyncHandler(eventCreationApi));
app.use('/api', asyncHandler(eventInfoApi));
app.use('/api', asyncHandler(notificaionApi));
app.use('/api', asyncHandler(itemListApi));
app.use('/api', asyncHandler(calendarApi));
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
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle real-time updates
    socket.on('Update', (data) => {
        console.log('Received Update data:', data);
        // Broadcast the update to all connected clients
        io.emit('Update ', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const shutdown = async (signal) => {
    console.log(`${signal} signal received. Closing HTTP server and Redis client...`);
    try {
        await new Promise((resolve, reject) => {
            server.close(err => {
                if (err) {
                    console.error('Error closing HTTP server:', err);
                    reject(err);
                } else {
                    console.log('HTTP server closed');
                    resolve();
                }
            });
        });

        //await redisClient.quit();
        //console.log('Redis client disconnected');
        
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
