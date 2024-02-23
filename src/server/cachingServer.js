const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const port = 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('path/to/your/credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-firebase-project-id.firebaseio.com',
});

const db = admin.firestore();

// Initialize NodeCache with a TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60 });

// Middleware to check cache before making a Firestore request
app.use(async (req, res, next) => {
  const cacheKey = req.url;

  // Check if data is in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Serving from cache');
    return res.json(cachedData);
  }

  // Continue to the next middleware if data is not in cache
  next();
});

// Example API endpoint to fetch and cache data from Firestore
app.get('/api/data/:collection', async (req, res) => {
  const collectionName = req.params.collection;
  const collectionRef = db.collection(collectionName);

  try {
    const querySnapshot = await collectionRef.get();
    const data = [];

    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    // Cache the data with a TTL (e.g., 5 minutes)
    cache.set(req.url, data, 300);

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Firestore:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
