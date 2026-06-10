import express from 'express';
import QuizAttempt from '../models/QuizAttempt.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Setup Gemini instance
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "MOCK_KEY";
const genAI = new GoogleGenerativeAI(apiKey);
const isMock = apiKey === "MOCK_KEY";

router.post('/generate', async (req, res) => {
  const { userId, topic = 'finance' } = req.body;

  if (isMock) {
    let quizData = [];
    const topicLower = topic.toLowerCase();
    if (topicLower.includes("insurance")) {
      quizData = [
        {
          question: "What is a premium in insurance terms?",
          options: ["A). The amount you pay to keep the policy active", "B). The maximum amount the insurance will pay", "C). The amount you pay out-of-pocket before insurance kicks in", "D). A reward for not making claims"],
          correctAnswer: "A",
          explanation: "The premium is the periodic payment made by the policyholder to the insurance company to keep the coverage active."
        },
        {
          question: "What is a deductible?",
          options: ["A). The monthly cost of your policy", "B). The amount you must pay out-of-pocket before the insurance pays a claim", "C). A tax deduction for having health insurance", "D). The process of cancelling a policy"],
          correctAnswer: "B",
          explanation: "A deductible is the specified amount of money that the insured must pay before an insurance company will pay any claim."
        },
        {
          question: "Which type of life insurance covers you for a specific period (e.g., 10 or 20 years)?",
          options: ["A). Whole Life Insurance", "B). Universal Life Insurance", "C). Term Life Insurance", "D). Permanent Life Insurance"],
          correctAnswer: "C",
          explanation: "Term life insurance provides coverage for a specific, predetermined period (the term)."
        },
        {
          question: "What does liability insurance cover?",
          options: ["A). Damage to your own property", "B). Your personal injuries in any accident", "C). Damage or injury you cause to other people or their property", "D). Loss of income due to illness"],
          correctAnswer: "C",
          explanation: "Liability insurance protects the insured against financial loss from claims of injury or property damage caused to others."
        },
        {
          question: "What is a co-payment (co-pay)?",
          options: ["A). A payment shared between two insurance companies", "B). A fixed amount you pay for a covered healthcare service at the time of service", "C). The fee to sign up for insurance", "D). A refund of unused premium"],
          correctAnswer: "B",
          explanation: "A co-payment is a flat fee paid by the policyholder at the time of receiving a medical service."
        }
      ];
    } else if (topicLower.includes("investment") || topicLower.includes("stock") || topicLower.includes("share")) {
      quizData = [
        {
          question: "What does 'diversification' mean in investing?",
          options: ["A). Investing all money in one high-performing stock", "B). Spreading investments across different assets to manage risk", "C). Converting all assets to cash", "D). Only buying government bonds"],
          correctAnswer: "B",
          explanation: "Diversification helps reduce risk by allocating investments across various financial instruments, industries, and categories."
        },
        {
          question: "What is a mutual fund?",
          options: ["A). A bank account shared by family members", "B). An investment program funded by shareholders that trades in diversified holdings", "C). A government program for retirement", "D). A loan given to a startup"],
          correctAnswer: "B",
          explanation: "A mutual fund pools money from multiple investors to purchase a diversified portfolio of stocks, bonds, or other securities."
        },
        {
          question: "What is inflation?",
          options: ["A). The rise in purchasing power of money", "B). The increase in stock market prices", "C). The general increase in prices and fall in the purchasing value of money", "D). The decrease in tax rates"],
          correctAnswer: "C",
          explanation: "Inflation represents the rate at which the general level of prices for goods and services is rising, eroding purchasing power."
        },
        {
          question: "What does 'bull market' refer to?",
          options: ["A). A market where prices are falling", "B). A market where prices are rising or expected to rise", "C). A market that is closed due to holiday", "D). A market dominated by agricultural goods"],
          correctAnswer: "B",
          explanation: "A bull market is characterized by optimism, investor confidence, and expectations that strong results will continue, driving prices up."
        },
        {
          question: "What is compound interest?",
          options: ["A). Interest calculated only on the principal amount", "B). Interest calculated on both the initial principal and the accumulated interest", "C). A penalty fee for late payments", "D). A fixed interest rate that never changes"],
          correctAnswer: "B",
          explanation: "Compound interest is 'interest on interest,' which causes wealth to grow at an accelerating rate over time."
        }
      ];
    } else {
      quizData = [
        {
          question: "Which of the following is considered a liability?",
          options: ["A). Cash in your wallet", "B). A house that you own completely", "C). An outstanding credit card balance", "D). Stocks in your brokerage account"],
          correctAnswer: "C",
          explanation: "A liability is something you owe, such as loans, credit card debt, or mortgages."
        },
        {
          question: "What is the recommended size of an emergency fund?",
          options: ["A). 1 month of expenses", "B). 3-6 months of expenses", "C). 2 years of expenses", "D). ₹10,000 flat"],
          correctAnswer: "B",
          explanation: "Most financial advisors recommend saving 3 to 6 months of living expenses in an easily accessible account for emergencies."
        },
        {
          question: "What does a credit score measure?",
          options: ["A). Your net worth", "B). The total amount of money you have in the bank", "C). Your creditworthiness and likelihood to repay debt", "D). Your monthly income"],
          correctAnswer: "C",
          explanation: "A credit score is a numerical expression based on a level analysis of a person's credit files, representing their creditworthiness."
        },
        {
          question: "What is a budget?",
          options: ["A). A plan for spending and saving money", "B). A list of items you bought last month", "C). A tax form filed with the government", "D). A discount coupon"],
          correctAnswer: "A",
          explanation: "A budget is a financial plan for a defined period, outlining estimated income and expenses."
        },
        {
          question: "What is the primary difference between a debit card and a credit card?",
          options: ["A). Debit cards have higher interest rates", "B). Debit cards draw from your bank account; credit cards borrow against a line of credit", "C). Credit cards cannot be used online", "D). Debit cards are only for ATM cash withdrawals"],
          correctAnswer: "B",
          explanation: "Debit cards spend money directly from your checking account, whereas credit cards allow you to borrow funds up to a certain limit to make purchases."
        }
      ];
    }
    return res.json(quizData);
  }

  const prompt = `Generate a gamified multiple-choice quiz on ${topic}. Return exactly 5 questions with 4 options each, one correct answer, and a detailed explanation. Return as a JSON array matching this schema:
[
  {
    "question": "...",
    "options": ["A).....", "B)......", "C)......", "D)......"],
    "correctAnswer": "B",
    "explanation": "..."
  }
]`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    const quizData = JSON.parse(aiText.trim());

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
