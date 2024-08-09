import express from 'express';
import { update, store, getFriends } from '../controllers/friendSystemController.js';

const router = express.Router();

// API endpoint to update pending friendrequests data
router.put('/users/update/friendrequests', update);

// API endpoint to store pending friendrequests 
router.post('/users/friendrequests', store);

// API endpoint to get friends data 
router.get('/users/friends/:uid', getFriends);

export default router;
