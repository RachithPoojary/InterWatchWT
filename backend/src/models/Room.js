import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, uppercase: true },
  createdBy: { type: String, required: true },
  applicantId: String,
  interviewerId: String,
  applicantName: String,
  interviewerName: String,
  status: { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
  language: { type: String, enum: ['javascript', 'python', 'java'], default: 'javascript' },
  code: { type: String, default: '' },
  startedAt: Date,
  endedAt: Date,
}, { timestamps: true });
roomSchema.statics.generateRoomId = async function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomId;
  do {
    roomId = Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (await this.findOne({ roomId }));
  return roomId;
};
roomSchema.methods.isFull = function() { return !!(this.applicantId && this.interviewerId); };
roomSchema.methods.getAvailableRole = function() {
  if (!this.applicantId) return 'applicant';
  if (!this.interviewerId) return 'interviewer';
  return null;
};
export default mongoose.model('Room', roomSchema);
