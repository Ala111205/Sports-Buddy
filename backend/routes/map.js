// map.js
import express from 'express';
import fetch from 'node-fetch'; // node-fetch v3 uses ESM
const router = express.Router();

// Simple in-memory cache
const cache = new Map();
// Cache TTL in milliseconds (e.g., 5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// To track last request time for throttling
let lastRequestTime = 0;
const THROTTLE_DELAY = 1100; // 1.1 seconds to stay under OSM limit

router.get('/search-location', async (req, res) => {
  const q = req.query.q;

  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Missing or empty query parameter' });
  }

  // Return cached result if available and not expired
  const cached = cache.get(q);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    // Throttle requests: ensure at least THROTTLE_DELAY between calls
    const now = Date.now();
    const waitTime = lastRequestTime + THROTTLE_DELAY - now;
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`,
      {
        headers: {
          'User-Agent': 'SportsBuddyApp/1.0 (contact: sadham070403@gmail.com)',
          'Accept-Language': 'en',
        },
      }
    );

    lastRequestTime = Date.now();

    if (!r.ok) {
      console.error('OSM API error:', r.status, r.statusText);
      return res.status(502).json({ error: 'Failed to fetch from OpenStreetMap' });
    }

    const data = await r.json();

    // Save to cache
    cache.set(q, { data, timestamp: Date.now() });

    res.json(data);
  } catch (err) {
    console.error('Map search error:', err);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

export default router;
