import express from 'express';
import { create, edit, remove, update } from '../controllers/eventCreationController.js';

const router = express.Router();

// Api endpoint to create a new event 
router.post('/event/create', create);

// API endpoint to edited events 
router.get('/events/edit/:eid', edit);

// API endpoint to delete event 
router.delete('/events/edit/delete/:eid', remove );

// API endpoint to store updated event data 
router.put('/events/edit/update', update)

export default router;