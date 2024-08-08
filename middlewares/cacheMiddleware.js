import cacheService from '../services/cacheService.js';

const cacheMiddleware = (key) => async (req, res, next) => {
    const data = await cacheService.get(key);
    if (data) {
        return res.json(JSON.parse(data));
    }
    res.sendResponse = res.send;
    res.send = async (body) => {
        await cacheService.set(key, body);
        res.sendResponse(body);
    };
    next();
};

export default cacheMiddleware;
