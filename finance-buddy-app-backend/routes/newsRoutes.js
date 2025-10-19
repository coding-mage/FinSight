import express from 'express';
import axios from 'axios';
import analyzeNewsImpact from '../services/analyzeNewsImpact.js';

const router = express.Router();

// Fetch top finance news
router.get('/top-finance', async (req, res) => {
  try {
    const newsRes = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'finance OR economy OR stock OR inflation OR budget',
          language: 'en',
          sortBy: 'publishedAt',
        },
        headers: {
          Authorization: `Bearer ${process.env.NEWS_API_KEY}`, // 👈 Add your auth token here
        }
      });
    res.json(newsRes.data);
  } catch (err) {
    console.error('Error fetching news:', err.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Analyze impact of selected news
router.post('/analyze', async (req, res) => {
  const { title, description, content } = req.body;
  try {
    const report = await analyzeNewsImpact({ title, description, content });
    res.json({ report });
  } catch (err) {
    console.error('Impact analysis error:', err.message);
    res.status(500).json({ error: 'Failed to generate impact report' });
  }
});

export default router;
