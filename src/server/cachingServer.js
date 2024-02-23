import express from 'express';
import { db } from '../firebase';
import axios from 'axios';
import NodeCache from 'node-cache';

const app = express();
const port = 3000;

// Initialize NodeCache with a TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60 });

// Firestore collection reference outside the endpoint handler
const collectionUserRef = collection(db, "users");

// Async middleware to check cache before making a Firestore request
app.use(async (req, res, next) => {
  const cacheKey = req.url;

  // Check if data is in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Serving from cache');
    return res.json(cachedData);
  }

  try {
    // Asynchronous operations go here

    // Continue to the next middleware if data is not in cache
    next();
  } catch (error) {
    console.error('Error in cache middleware:', error.message);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});

// Updated API endpoint to fetch and cache the entire "users" collection
app.get('/api/data/users', async (req, res) => {
  try {
    const querySnapshot = await collectionUserRef.get();
    const data = [];

    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    // Cache the data with a TTL (e.g., 10 minutes)
    cache.set(req.url, data, 600);

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Firestore:', error.message);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
