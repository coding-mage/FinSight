import express from 'express';
import QuizAttempt from '../models/QuizAttempt.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Setup Gemini instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
  const { userId, topic = 'finance' } = req.body;

  const prompt = `Generate a gamified multiple-choice quiz on ${topic}. Return 5 questions with 4 options each, one correct answer, and a detailed explanation. Return as JSON in this format:
[
  {
    "question": "...",
    "options": ["A).....", "B)......", "C)......", "D)......"],
    "correctAnswer": "B",
    "explanation": "..."
  }
]`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    const match = aiText.match(/```json([\s\S]*?)```/) || aiText.match(/```([\s\S]*?)```/);
    const quizData = match ? JSON.parse(match[1]) : [];

    // await QuizAttempt.create({
    //   userId,
    //   questions: quizData.map(q => ({ ...q, userAnswer: '' })),
    //   score: 0,
    // });

    res.json(quizData);
  } catch (error) {
    console.error('Error generating quiz:', error.message);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

router.post('/submit', async (req, res) => {
  const { userId, questions, answers } = req.body;
  console.log(answers)
  try {
    const score = answers.reduce((acc, ans, i) =>
      acc + (ans === questions[i].correctAnswer ? 1 : 0), 0);

    const updatedQuestions = questions.map((q, i) => {
      const userAnswer = answers[i];
      return {
        ...q,
        userAnswer,
      };
    });

    console.log("************************************");
    const attempt = new QuizAttempt({
      userId,
      questions: updatedQuestions,
      answers,
      score
    });

    console.log(userId,
      updatedQuestions,
      answers,
      score, );
      console.log("************************************");
    await attempt.save();
    res.json({ score, total: questions.length, explanations: questions.map(q => q.explanation) });
  } catch (err) {
    console.error('Quiz submission error:', err.message);
    res.status(500).json({ error: 'Submission failed' });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.params.userId }).sort({ attemptedAt: -1 });
    console.log(attempts);
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch history' });
  }
});


export default router;
