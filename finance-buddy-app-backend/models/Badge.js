import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String },               // New field for emoji or icon URL
  description: { type: String },        // New field for badge description
  earnedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Badge', badgeSchema);
