import express from 'express';
import Challenge from '../models/Challenge.js';
import Badge from '../models/Badge.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate", async (req, res) => {
  const { userId, currentPrompt } = req.body;

  try {
    const pastChallenges = await Challenge.find({ userId }).sort({ createdAt: -1 });

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
    const challenges = await Challenge.find({ userId, completed: true }).sort({ createdAt: -1 });
    // Prompt AI to generate badge details
    const prompt = `Create a fun and creative badge for completing this financial challenge: "${challenge.prompt}". Return a JSON object with "name", "icon" (emoji or short text), and "description". Example:
{
  "name": "Budget Master",
  "icon": "💰",
  "description": "Awarded for mastering your budget challenges!"
}
  
Please keep in mind that you should not generate any of the following challenges as they are already taken up by the user previously:
  ${JSON.stringify(challenges)}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    console.log(aiText);

    // Parse JSON from AI response (basic regex to extract JSON)
    const match = aiText.match(/\{[\s\S]*\}/);
    let badgeData = { name: 'Financial Hero', icon: '🏅', description: 'Awarded for completing a challenge!' };
    if (match) {
      badgeData = JSON.parse(match[0]);
    }

    // Save badge to DB
    const badge = new Badge({ 
      userId, 
      name: badgeData.name, 
      icon: badgeData.icon, 
      description: badgeData.description,
      earnedAt: new Date()
    });
    await badge.save();

    res.json({ message: 'Challenge completed and badge earned!', badge });
  } catch (err) {
    console.error('Completion failed:', err);
    res.status(500).json({ error: 'Failed to complete challenge' });
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