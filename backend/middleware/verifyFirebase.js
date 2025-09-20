// middleware/verifyFirebase.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

// Read and parse the JSON file
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (err) {
  console.error('❌ Failed to read serviceAccountKey.json:', err);
  process.exit(1);
}

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err);
    process.exit(1);
  }
}

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : null;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Always attach uid/email
    req.user = { uid: decoded.uid, email: decoded.email };

    // fetch MongoDB user
    const mongoUser = await User.findOne({ firebaseUid: decoded.uid });

    if (mongoUser) {
      req.user.role = mongoUser.role; // add role from DB
    } else {
      req.user.role = 'user'; // default role
    }

    console.log('Decoded UID:', decoded.uid);
    console.log('Mongo User:', mongoUser);
    console.log('Req User:', req.user);

    next();
  } catch (err) {
    logger.warn(`Token verification failed: ${err.message}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export default verifyFirebaseToken;
