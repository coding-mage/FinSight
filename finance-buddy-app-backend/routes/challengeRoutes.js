import express from 'express';
import Challenge from '../models/Challenge.js';
import Badge from '../models/Badge.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "MOCK_KEY";
const genAI = new GoogleGenerativeAI(apiKey);
const isMock = apiKey === "MOCK_KEY";

router.post("/generate", async (req, res) => {
  const { userId, currentPrompt } = req.body;

  if (isMock) {
    const mockChallenges = [
      "Track every rupee you spend for 3 days.",
      "Save ₹500 this week by cooking at home.",
      "Review and cancel one unused subscription today.",
      "Create a monthly budget and stick to it for the next 7 days.",
      "Put ₹1000 into your savings account immediately.",
      "Buy only essential groceries and skip snacks for 3 days.",
      "Find one way to reduce your electricity bill this month.",
      "Read a personal finance article or watch an educational video today.",
      "Set a financial goal for the next 6 months and write it down.",
      "Identify three unnecessary expenses from last week."
    ];
    let filtered = mockChallenges;
    try {
      const pastChallenges = await Challenge.find({ userId }).sort({ createdAt: -1 }).limit(10);
      const pastPrompts = pastChallenges.map(ch => ch.prompt);
      filtered = mockChallenges.filter(ch => !pastPrompts.includes(ch) && ch !== currentPrompt);
      if (filtered.length === 0) filtered = mockChallenges;
    } catch (dbErr) {
      console.error("Mock challenge DB query failed:", dbErr);
    }
    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
    return res.json({ prompt: chosen });
  }

  try {
    const pastChallenges = await Challenge.find({ userId }).sort({ createdAt: -1 }).limit(10);

    const previousPrompts = pastChallenges.map(ch => `"${ch.prompt}"`).join(', ');
    const additionalAvoidPrompt = currentPrompt ? `Also, do not repeat or slightly modify the following challenge: "${currentPrompt}".` : '';

    const prompt = `Generate a fun, actionable, single-line personal finance challenge for a user. 
Example: "Track every rupee you spend for 3 days."
Avoid repeating or closely paraphrasing any of the following previously generated or completed challenges:
${previousPrompts}
${additionalAvoidPrompt}
Return only the new challenge, no explanation.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const aiText = result.response.text().replace(/[`*]/g, "").trim();

    res.json({ prompt: aiText }); // Still only return the prompt, don't save
  } catch (err) {
    console.error("Challenge generation failed:", err);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});


router.post('/complete', async (req, res) => {
  const { userId, challengeId } = req.body;

  try {
    // Mark challenge as completed
    const challenge = await Challenge.findByIdAndUpdate(challengeId, { completed: true }, { new: true });
    
    // Get existing badge names to avoid duplicates
    const existingBadges = await Badge.find({ userId }).select('name');
    const badgeNames = existingBadges.map(b => b.name);

    if (isMock) {
      let badgeData = {
        name: "Savings Sentinel",
        icon: "🛡️",
        description: "Awarded for keeping a close watch on your spending habits."
      };
      const promptLower = (challenge.prompt || "").toLowerCase();
      if (promptLower.includes("cook") || promptLower.includes("food") || promptLower.includes("home")) {
        badgeData = {
          name: "Culinary Captain",
          icon: "🍳",
          description: "Awarded for saving money by cooking delicious meals at home."
        };
      } else if (promptLower.includes("subscription") || promptLower.includes("cancel")) {
        badgeData = {
          name: "Subscription Slasher",
          icon: "✂️",
          description: "Awarded for cancelling unused plans and cutting overheads."
        };
      } else if (promptLower.includes("track") || promptLower.includes("spend")) {
        badgeData = {
          name: "Expense Tracker",
          icon: "📊",
          description: "Awarded for tracking your expenses meticulously."
        };
      } else if (promptLower.includes("budget") || promptLower.includes("save")) {
        badgeData = {
          name: "Budget Master",
          icon: "💰",
          description: "Awarded for mastering your budget and savings targets."
        };
      }
      
      const badge = new Badge({ 
        userId, 
        name: badgeData.name, 
        icon: badgeData.icon, 
        description: badgeData.description,
        earnedAt: new Date()
      });
      await badge.save();
      return res.json({ message: 'Challenge completed and badge earned!', badge });
    }

    // Prompt AI to generate badge details
    const prompt = `Create a fun and creative badge for completing this financial challenge: "${challenge.prompt}".
Return a JSON object with "name", "icon" (emoji or short text), and "description". Example:
{
  "name": "Budget Master",
  "icon": "💰",
  "description": "Awarded for mastering your budget challenges!"
}
  
Please do not repeat or duplicate any of the following badge names already earned by the user:
${badgeNames.join(', ')}`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    console.log(aiText);

    let badgeData = JSON.parse(aiText.trim());

    // Save badge to DB
    const badge = new Badge({ 
      userId, 
      name: badgeData.name || 'Financial Hero', 
      icon: badgeData.icon || '🏅', 
      description: badgeData.description || 'Awarded for completing a challenge!',
      earnedAt: new Date()
    });
    await badge.save();

    res.json({ message: 'Challenge completed and badge earned!', badge });
  } catch (err) {
    console.error('Completion failed:', err);
    // Graceful fallback to avoid server crash on API issues
    try {
      const fallbackBadge = new Badge({ 
        userId, 
        name: 'Financial Hero', 
        icon: '🏅', 
        description: 'Awarded for completing a challenge!',
        earnedAt: new Date()
      });
      await fallbackBadge.save();
      res.json({ message: 'Challenge completed and badge earned!', badge: fallbackBadge });
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to complete challenge' });
    }
  }
});

router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const challenges = await Challenge.find({ userId, completed: true }).sort({ createdAt: -1 });
    const badges = await Badge.find({ userId }).sort({ earnedAt: -1 });
    res.json({ challenges, badges });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.post('/start', async (req, res) => {
  const { userId, challengeId } = req.body;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge || challenge.userId.toString() !== userId) {
      return res.status(404).json({ error: 'Challenge not found or unauthorized' });
    }

    challenge.started = true;
    await challenge.save();

    res.json({ message: 'Challenge marked as started', challenge });
  } catch (err) {
    console.error('Start challenge failed:', err);
    res.status(500).json({ error: 'Failed to start challenge' });
  }
});

router.get('/active/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const existing = await Challenge.findOne({ userId, completed: false }).sort({ createdAt: -1 });
    res.json(existing);
  } catch (err) {
    console.error('Error fetching active challenge:', err);
    res.status(500).json({ error: 'Failed to fetch active challenge' });
  }
});

router.get('/latest/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const latest = await Challenge.findOne({ userId }).sort({ createdAt: -1 });
    res.json(latest);
  } catch (err) {
    console.error('Error fetching latest challenge:', err);
    res.status(500).json({ error: 'Failed to fetch latest challenge' });
  }
});

router.post('/takeup', async (req, res) => {
  const { userId, prompt } = req.body;
  try {
    // Check if user has any incomplete challenge (optional)
    const existing = await Challenge.findOne({ userId, completed: false });
    console.log("+++++++++++++++")
    console.log(existing);
    if (existing) {
      return res.status(400).json({ error: 'You already have an active challenge.' });
    }
    

    const challenge = new Challenge({ userId, prompt });
    await challenge.save();
    res.json(challenge);
  } catch (err) {
    console.error('Failed to save challenge:', err);
    res.status(500).json({ error: 'Failed to take up challenge' });
  }
});



export default router;