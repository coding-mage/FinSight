import express from 'express';
import multer from 'multer';
import axios from 'axios';
import Income from '../models/Income.js'; // Make sure you import your models
import Expense from '../models/Expense.js';

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

const router = express.Router();



// Manual income entry
router.post('/income/manual', async (req, res) => {
  try {
    const income = new Income({ ...req.body, user: req.user._id });
    await income.save();
    res.status(201).json({ message: 'Income saved', income });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save income' });
  }
});

// Manual expense entry
router.post('/expense/manual', async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, user: req.user._id });
    await expense.save();
    res.status(201).json({ message: 'Expense saved', expense });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

// OCR + AI parsing of uploaded file
router.post('/expense/parse', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;

    const response = await axios.post('http://localhost:5000/parse-expense', fileBuffer, {
      headers: { 'Content-Type': 'application/pdf' }
    });

    res.json({ parsedData: response.data });
  } catch (err) {
    res.status(500).json({ error: 'Parsing failed' });
  }
});

// Finalizing parsed expense
router.post('/expense/finalize', async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, source: 'ai', user: req.user._id });
    await expense.save();
    res.status(201).json({ message: 'Parsed expense saved', expense });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save parsed expense' });
  }
});

// AI-powered income autocomplete
router.post('/income/autocomplete', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5000/autocomplete-income', req.body);
    res.json({ completed: response.data });
  } catch (err) {
    res.status(500).json({ error: 'Autocomplete failed' });
  }
});

export default router;