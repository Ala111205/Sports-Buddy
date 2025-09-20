// models/Sport.js
import mongoose from 'mongoose';

const sportSchema = new mongoose.Schema({
  name: { type: String, required: true },   
  rules: { type: String },               
  players: { type: Number }                 
});

const Sport = mongoose.model('Sport', sportSchema);

export default Sport;

