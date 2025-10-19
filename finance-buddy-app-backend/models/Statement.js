// server/models/Statement.js
import mongoose from 'mongoose';

// Transaction schema for individual transactions
const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  vendor: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  }
});

// Statement schema for storing bank statement information
const StatementSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    //default: 'default-user' // Replace with actual user ID from auth system
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  transactions: [TransactionSchema],
  summary: {
    type: String
  },
  suggestions: {
    type: String
  }
});

const Statement = mongoose.model('Statement', StatementSchema);
export default Statement;
