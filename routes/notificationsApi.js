import express from 'express';
import { pending } from '../controllers/notificationController.js';

const router = express.Router();

// API endpoint to get pending friendrequests notification 
router.get('/users/friendrequests/:uid', pending);

export default router;
