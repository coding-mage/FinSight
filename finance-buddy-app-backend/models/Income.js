import mongoose from 'mongoose'

const incomeSchema = new mongoose.Schema({
  amount: Number,
  source: String,
  category: String,
  taxable: Boolean,
  receivedThrough: String,
  date: Date,
  notes: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Income = mongoose.model('Income', incomeSchema);
export default Income;
