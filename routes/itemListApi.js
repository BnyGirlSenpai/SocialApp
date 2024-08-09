import express from 'express';
import { create, getItemList, remove, update, saveUserItemDistribution, getUserItemDistribution } from '../controllers/itemListController.js';

const router = express.Router();

// API endpoint to edit and create Item Lists 
router.post('/events/itemlist/edit/:event_id', create);

// API endpoint to get Item Lists 
router.get('/events/itemlist/:event_id', getItemList);

// API endpoint to update Item Lists 
router.put('/events/itemlist/update/:event_id', update);

// API endpoint to delete Item Lists 
router.delete('/events/itemslist/delete/:label/:event_id', remove);

// API endpoint to store user item distribution
router.post('/events/itemslist/add/count', saveUserItemDistribution);

// API endpoint to get user item distribution 
router.get('/events/itemslist/get/count/:uid/:event_id', getUserItemDistribution);

export default router;
