// routes/auth.js
import express from 'express';
import verify from '../middleware/verifyFirebase.js';
import User from '../models/User.js';

const router = express.Router();

// GET /me (current logged-in user)
router.get('/me', verify, async (req, res) => {
  try {
    const mongoUser = await User.findOne({ firebaseUid: req.user.uid });

    if (!mongoUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(mongoUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
