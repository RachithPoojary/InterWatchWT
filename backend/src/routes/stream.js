import express from 'express';
import { requireAuth, validateClerkUser } from '../middleware/auth.js';
import { generateStreamToken } from '../lib/stream.js';
const router = express.Router();
router.post('/token', requireAuth(), validateClerkUser, async (req, res) => {
  const token = generateStreamToken(req.userId);
  res.json({ success: true, token, userId: req.userId, apiKey: process.env.STREAM_API_KEY });
});
export default router;
