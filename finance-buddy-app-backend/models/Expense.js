import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  amount: Number,
  category: String,
  vendor: String,
  paymentMethod: String,
  date: Date,
  tags: [String],
  notes: String,
  source: { type: String, enum: ['manual', 'ai'], default: 'manual' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
