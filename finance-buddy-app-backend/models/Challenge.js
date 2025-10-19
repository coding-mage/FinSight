import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  started: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
});


export default mongoose.model('Challenge', challengeSchema);