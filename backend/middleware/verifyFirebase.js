// middleware/verifyFirebase.js
import admin from 'firebase-admin';
import User from '../models/User.js';
import logger from '../utils/logger.js';

let serviceAccount;
try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env variable is missing');
  }
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log("FIREBASE_SERVICE_ACCOUNT: ", serviceAccount);
  console.log("Firebase Admin project_id:", serviceAccount.project_id);
} catch (err) {
  console.error('❌ Failed to load Firebase service account:', err);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin initialized');
}

export default async function verify(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : null;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    const mongoUser = await User.findOne({ firebaseUid: decoded.uid });
    req.user.role = mongoUser?.role || 'user';
    next();
  } catch (err) {
    logger.warn(`Token verification failed: ${err.message}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
