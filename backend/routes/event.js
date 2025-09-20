// routes/event.js
import express from 'express';
import Event from '../models/Event.js';
import verify from '../middleware/verifyFirebase.js';
import checkAdmin from '../middleware/checkAdmin.js';
import logger from '../utils/logger.js';

const router = express.Router();

// CREATE event
router.post('/event-create', verify, checkAdmin, async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user.uid };
    const event = new Event(payload);
    await event.save();

    logger.info(`Event created by ${req.user.uid}: ${event._id}`);
    res.status(201).json(event);
  } catch (error) {
    logger.error(`Create event error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// GET all events - public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate({ path: 'sport', options: { lean: true } })
      .sort({ startDate: 1 }); // sort by startDate instead of 'date'
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE event by ID
router.put('/:id', verify, checkAdmin, async (req, res) => {
    console.log("Req User: ", req.user)
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (
      event.createdBy.toString() !== req.user.uid &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(event, req.body); // update fields

    // ✅ Explicitly cast startDate to Date if present
    if (req.body.startDate) {
      event.startDate = new Date(req.body.startDate);
    }

    await event.save();

    logger.info(`Event updated by ${req.user.uid}: ${event._id}`);
    res.status(200).json(event);
  } catch (error) {
    logger.error(`Update event error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// DELETE event by ID
router.delete('/:id', verify, checkAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (
      event.createdBy.toString() !== req.user.uid &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await event.deleteOne();
    logger.info(`Event deleted by ${req.user.uid}: ${event._id}`);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    logger.error(`Delete event error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;
