// models/Event.js
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    city: String,
    area: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [lng, lat] if using geo
    },
    startDate: Date,
    capacity: Number,
    description: String,
    createdBy: { type: String }, // Firebase UID
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', EventSchema);

export default Event;
