import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['applicant', 'interviewer'], required: true },
  profileImage: String,
  roomsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  roomsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
}, { timestamps: true });
export default mongoose.model('User', userSchema);
