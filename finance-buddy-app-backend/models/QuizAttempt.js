import mongoose from 'mongoose'

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: Date, default: Date.now },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
      userAnswer: String,
      explanation: String,
    }
  ],
  score: Number
});

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;
