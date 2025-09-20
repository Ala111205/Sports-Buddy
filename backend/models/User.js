// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['user', 'admin']}
});

const User = mongoose.model('User', UserSchema);

export default User;
