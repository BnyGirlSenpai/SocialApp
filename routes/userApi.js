import express from 'express';
import { getUser, store, update } from '../controllers/userController.js'; 

const router = express.Router();

// API endpoint to get user profile data
router.get('/users/:uid', getUser);

// API endpoint to store init user data
router.post('/users', store);

// API endpoint to update user profile data
router.put('/users/update', update);

export default router;
