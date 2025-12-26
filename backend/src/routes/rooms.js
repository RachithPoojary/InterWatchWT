import express from 'express';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { requireAuth, validateClerkUser } from '../middleware/auth.js';
const router = express.Router();
router.post('/', requireAuth(), validateClerkUser, async (req, res) => {
  const { language = 'javascript' } = req.body;
  let user = await User.findOne({ clerkId: req.userId });
  if (!user) user = await User.create({ clerkId: req.userId, email: req.userEmail, name: req.userName, role: 'interviewer' });
  const roomId = await Room.generateRoomId();
  const room = await Room.create({
    roomId, createdBy: req.userId, language,
    interviewerId: user.role === 'interviewer' ? req.userId : null,
    applicantId: user.role === 'applicant' ? req.userId : null,
  });
  res.status(201).json({ success: true, room: { roomId: room.roomId, language: room.language } });
});
router.get('/open', requireAuth(), async (req, res) => {
  const rooms = await Room.find({ status: 'waiting', $or: [{ applicantId: null }, { interviewerId: null }] }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, rooms: rooms.map(r => ({ id: r._id, roomId: r.roomId, language: r.language, availableRole: r.getAvailableRole() })) });
});
router.get('/:roomId', requireAuth(), async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId.toUpperCase() });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ success: true, room });
});
router.put('/:roomId/join', requireAuth(), validateClerkUser, async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId.toUpperCase() });
  if (!room || room.isFull()) return res.status(400).json({ error: 'Room full or not found' });
  const availableRole = room.getAvailableRole();
  if (availableRole === 'applicant') room.applicantId = req.userId;
  else room.interviewerId = req.userId;
  if (room.isFull()) room.status = 'active';
  await room.save();
  res.json({ success: true, room: { roomId: room.roomId, assignedRole: availableRole } });
});
router.get('/user/my-rooms', requireAuth(), validateClerkUser, async (req, res) => {
  const rooms = await Room.find({ $or: [{ createdBy: req.userId }, { applicantId: req.userId }, { interviewerId: req.userId }] }).sort({ createdAt: -1 });
  res.json({ success: true, rooms });
});
export default router;
