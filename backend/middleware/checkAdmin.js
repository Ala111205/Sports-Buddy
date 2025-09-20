// middleware/checkAdmin.js
import User from '../models/User.js';

const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin Only' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default checkAdmin;
