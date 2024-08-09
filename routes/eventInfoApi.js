import express from 'express';
import { allGuests, invited, detail, joined, owner, publicEvents} from '../controllers/eventInfoController.js';

const router = express.Router();

// API endpoint to get all guests ids (invited and joined) for a given event 
router.get('/events/guests/:event_id', allGuests);

// API endpoint to get events the current user is an invited guest 
router.get('/events/invited/:uid', invited);

// API endpoint to get event detail information 
router.get('/events/eventDetail/:event_id', detail);

// API endpoint to get events curent user is owner
router.get('/events/:uid', owner);

// API endpoint to get events the current user is a joined guest 
router.get('/events/joined/:uid', joined);

// API endpoint to get public events with pagination 
router.get('/public/events', publicEvents);

export default router;