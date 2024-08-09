import express from 'express';
import { invites, userStatusUpdate, joinPublic} from '../controllers/eventInviteController.js';

const router = express.Router();

// API endpoint to store event invites uid's
router.post('/events/invites/:event_id', invites);    

// API to update event database after invited guest interaction
router.put('/events/userStatus/update', userStatusUpdate);

// API to join public events
router.put('/join/public/event', joinPublic);

export default router;