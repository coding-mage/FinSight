// controllers/expenseAIController.js
import fs from 'fs';
//import pdf from 'pdf-parse';
import { askGemini } from '../utils/geminiUtils.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const parseExpense = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `
You are a financial assistant. From the text below (extracted from a receipt or bank statement), extract:

- Vendor
- Amount
- Date
- Category (food, rent, travel, etc.)

Respond in this JSON format:
{
  "vendor": "...",
  "amount": ...,
  "date": "...",
  "category": "..."
}

Text:
${pdfData.text}
    `;

    const aiResponse = await askGemini(prompt);
    fs.unlinkSync(req.file.path); 
    res.json({ parsed: JSON.parse(aiResponse) });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const autocompleteIncome = async (req, res) => {
  try {
    const userInput = JSON.stringify(req.body, null, 2);

    const prompt = `
You're a financial assistant. Given the partial income info below, intelligently fill missing fields.

Respond in JSON:
{
  "source": "...",
  "amount": ...,
  "date": "...",
  "category": "salary|freelance|investment|rental|other"
}

Partial:
${userInput}
    `;

    const aiResponse = await askGemini(prompt);
    res.json({ completed: JSON.parse(aiResponse) });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
