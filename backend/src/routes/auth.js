import express from 'express';
import User from '../models/User.js';
import { requireAuth, validateClerkUser } from '../middleware/auth.js';
import { upsertStreamUser } from '../lib/stream.js';
const router = express.Router();
router.post('/sync', requireAuth(), validateClerkUser, async (req, res) => {
  const { role, name, email } = req.body;
  let user = await User.findOne({ clerkId: req.userId });
  if (!user) {
    user = await User.create({ clerkId: req.userId, email: email || req.userEmail, name: name || req.userName, role: role || 'applicant' });
  } else {
    if (role) user.role = role;
    await user.save();
  }
  await upsertStreamUser(req.userId, { name: user.name, role: user.role });
  res.json({ success: true, user });
});
router.get('/me', requireAuth(), validateClerkUser, async (req, res) => {
  const user = await User.findOne({ clerkId: req.userId });
  res.json({ success: true, user });
});
export default router;
