// map.js
import express from 'express';
import fetch from 'node-fetch'; // node-fetch v3 uses ESM
const router = express.Router();

router.get('/search-location', async (req, res) => {
  const q = req.query.q;
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0 (your@email.com)',
        },
      }
    );
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

export default router;
