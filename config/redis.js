import { createClient } from 'redis';

const redisClient = createClient({
    host: 'localhost',
    port: 6379
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Could not connect to Redis:', err);
    }
})();

export default redisClient;
