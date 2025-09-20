// routes/sport.js
import express from 'express';
import Sport from '../models/Sport.js';
import verify from '../middleware/verifyFirebase.js';
import checkAdmin from '../middleware/checkAdmin.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Create a new sport
router.post('/create', verify, checkAdmin, async (req, res) => {
  try {
    console.log('REQ BODY:', req.body);
    const sport = new Sport(req.body);
    await sport.save();
    res.status(201).json(sport);
  } catch (err) {
    console.error('CREATE SPORT ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET all events - public
router.get('/', async (req, res) => {
  try {
    const sport = await Sport.find();
    
    res.json(sport)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE sport by ID
router.put('/:id', verify, checkAdmin, async (req, res) => {
  console.log("Req User: ", req.user)
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    // Only allow if createdBy is user or admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(sport, req.body); // update fields from body
    await sport.save();

    logger.info(`Sport updated by ${req.user.uid}: ${sport._id}`);
    res.status(200).json(sport);
  } catch (error) {
    logger.error(`Update sport error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// DELETE sport by ID
router.delete('/:id', verify, checkAdmin, async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    // Only allow if createdBy is user or admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await sport.deleteOne();

    logger.info(`Sport deleted by ${req.user.uid}: ${sport._id}`);
    res.status(200).json('Sport deleted successfully');
  } catch (error) {
    logger.error(`Delete sport error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;
