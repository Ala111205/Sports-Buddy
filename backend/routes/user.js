// routes/user.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import verify from '../middleware/verifyFirebase.js';

const router = express.Router();

// REGISTER / UPSERT user
router.post('/register', verify, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { password, name, role } = req.body;

    const roleFromRequest = role;

    // build fields to update
    let updateFields = { email, name, role: roleFromRequest };

    // hash password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    // upsert user by uid
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      updateFields,
      { upsert: true, new: true }
    );

    // remove password from response
    const { password: pw, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    // unified error response
    res.status(500).json({ error: error.message });
  }
});

export default router;
