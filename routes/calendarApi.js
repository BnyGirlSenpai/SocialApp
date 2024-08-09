import express from 'express';
import { calendarEvents } from '../controllers/calenderController.js';

const router = express.Router();

// API endpoint to get events the current user is either the owner or invited 
router.get('/calendar/:uid', calendarEvents);

export default router;