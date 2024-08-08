import redisClient from '../config/redis.js';

const set = async (key, value, duration = 3600) => {
    await redisClient.set(key, value, 'EX', duration);
};

const get = async (key) => {
    return await redisClient.get(key);
};

export default { set, get };
