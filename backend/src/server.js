import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import env from './lib/env.js';
import { connectDB } from './lib/db.js';
import { clerkAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import roomsRouter from './routes/rooms.js';
import authRouter from './routes/auth.js';
import streamRouter from './routes/stream.js';
import executeRouter from './routes/execute.js';
import Room from './models/Room.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: env.FRONTEND_URL, credentials: true } });

app.use(helmet());
app.use(compression());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(clerkAuth);
app.use('/api/', apiLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/stream', streamRouter);
app.use('/api/execute', executeRouter);
app.use(notFound);
app.use(errorHandler);

const roomsNamespace = io.of('/rooms');
roomsNamespace.on('connection', (socket) => {
  socket.on('join-room', async (data) => {
    const room = await Room.findOne({ roomId: data.roomId.toUpperCase() });
    if (!room) return socket.emit('error', { message: 'Room not found' });
    socket.join(data.roomId.toUpperCase());
    socket.data = data;
    let role = room.applicantId === data.userId ? 'applicant' : room.interviewerId === data.userId ? 'interviewer' : 'viewer';
    socket.emit('room-joined', { roomId: room.roomId, language: room.language, code: room.code, role });
    roomsNamespace.to(data.roomId.toUpperCase()).emit('user-joined', { userId: data.userId, userName: data.userName });
  });
  socket.on('code-change', async (data) => {
    await Room.findOneAndUpdate({ roomId: data.roomId.toUpperCase() }, { code: data.code });
    socket.to(data.roomId.toUpperCase()).emit('code-updated', { code: data.code });
  });
  socket.on('language-change', async (data) => {
    await Room.findOneAndUpdate({ roomId: data.roomId.toUpperCase() }, { language: data.language });
    roomsNamespace.to(data.roomId.toUpperCase()).emit('language-updated', { language: data.language });
  });
  socket.on('end-interview', async (data) => {
    await Room.findOneAndUpdate({ roomId: data.roomId.toUpperCase() }, { status: 'ended', endedAt: new Date() });
    roomsNamespace.to(data.roomId.toUpperCase()).emit('interview-ended', { roomId: data.roomId });
  });
  socket.on('disconnect', () => {
    if (socket.data?.roomId) roomsNamespace.to(socket.data.roomId).emit('user-left', { userId: socket.data.userId });
  });
    // Chat: receive message and broadcast to room
  socket.on('chat-message', (data) => {
    // data: { roomId, userId, userName, text, timestamp }
    const roomKey = data.roomId.toUpperCase();
    roomsNamespace.to(roomKey).emit('chat-message', {
      userId: data.userId,
      userName: data.userName,
      text: data.text,
      timestamp: data.timestamp || new Date().toISOString(),
    });
  });

});

await connectDB();
const PORT = env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
