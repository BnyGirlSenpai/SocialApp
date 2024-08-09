import express from 'express';
import { searchUsers } from '../controllers/searchController.js';

const router = express.Router();

// API endpoint to get user search data 
router.get('/users/search/:username', searchUsers);

export default router;