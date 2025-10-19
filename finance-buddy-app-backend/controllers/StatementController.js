import path from 'path';
import axios from 'axios';
import { createWorker } from 'tesseract.js';
import Statement from '../models/Statement.js';
import fs from 'fs';
import config from '../config/config.js'
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract text using Tesseract.js
// controllers/StatementController.js or a separate utils/ocr.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function extractTextFromPDF(filePath) {
    console.log(filePath)
  const extension = path.extname(filePath).toLowerCase();
  

    const fileBuffer = fs.readFileSync(filePath); // read YOUR uploaded file
    const data = await pdfParse(fileBuffer);
    console.log(data.text);
    return data.text; 

}



// const processWithGemini = async (text) => {
//   try {
//     const prompt = `
//       Analyze the following bank statement and extract all transactions.
//       For each transaction, provide the following details in JSON format:
//       - amount (numeric value without currency symbol)
//       - date (in DD-MM-YYYY format)
//       - vendor (name of the merchant/company)
//       - category (like food, transport, utilities, etc.)
//       - type (either "income" or "expense")
      
//       Return only a valid JSON array of transactions without any additional explanation.
      
//       Bank statement text:
//       ${text}
//     `;

//     const response = await axios.post(
//       `${config.GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`,
//       {
//         contents: [{ parts: [{ text: prompt }] }]
//       }
//     );
//     console.log(response.text)
//     const content = response.data.candidates[0].content.parts[0].text;
//     const jsonMatch = content.match(/\[[\s\S]*\]/);

//     if (jsonMatch) {
//       return JSON.parse(jsonMatch[0]);
//     } else {
//       throw new Error('Failed to parse transactions from Gemini response');
//     }
//   } catch (error) {
//     console.error('Error processing with Gemini:', error);
//     throw new Error('Failed to process bank statement with Gemini');
//   }
// };

export async function processWithGemini(rawText) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a financial assistant. You are a financial assistant. 

Return the output ONLY in pure JSON format as an array like this:

Analyze the following bank statement and extract all transactions.
      For each transaction, provide the following details in JSON format:
      - amount (numeric value without currency symbol)
      - date (in DD-MM-YYYY format)
      - vendor (name of the merchant/company)
      - category (like food, transport, utilities, Retail etc.). Please try to avoid giving unknown as a category.
      - type (either "income" or "expense")
      
      Return only a valid JSON array of transactions without any additional explanation.
      
      Bank statement text:
""" 
${rawText}
"""
  `.trim();

  const result = await model.generateContent(prompt);
  let aiText = await result.response.text();

  aiText = aiText.replace(/```.*?\n/, '').replace(/```$/, '').trim();
  const jsonStart = aiText.indexOf('[');
  const jsonEnd = aiText.lastIndexOf(']');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    aiText = aiText.slice(jsonStart, jsonEnd + 1);
  } else {
    throw new Error('Could not find JSON array in AI response.');
  }

  try {
    const parsedExpenses = JSON.parse(aiText);
    console.log(parsedExpenses)
    return parsedExpenses;
  } catch (err) {
    console.error('Failed to parse AI output:', err);
    throw new Error('Failed to parse AI response as JSON.');
  }
}

const generateInsights = async (transactions) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following bank transactions and provide:
      1. A brief summary of spending habits
      2. 3-5 specific suggestions for improving financial health and saving money
      
      Transactions:
      ${JSON.stringify(transactions)}
      
      Format the response as a JSON with two fields:
      {
        "summary": "summary text here",
        "suggestions": "bullet point suggestions here"
      }
    `;

    const result = await model.generateContent(prompt);
  let aiText = await result.response.text();
    console.log(aiText);
  aiText = aiText.replace(/```.*?\n/, '').replace(/```$/, '').trim();
  aiText = aiText.replace(/```$/, '')
//   const jsonStart = aiText.indexOf('[');
//   const jsonEnd = aiText.lastIndexOf(']');
//   if (jsonStart !== -1 && jsonEnd !== -1) {
//     aiText = aiText.slice(jsonStart, jsonEnd + 1);
//   } else {
//     throw new Error('Could not find JSON array in AI response.');
//   }
console.log(aiText);
  try {
     const parsedInsights = JSON.parse(aiText);
     console.log(parsedInsights)
    return parsedInsights;
  } catch (err) {
    console.error('Failed to parse AI output:', err);
    throw new Error('Failed to parse AI response as JSON.');
  }
};

// Upload and process statement
const uploadStatement = async (req, res) => {
    try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
    
        const userId = req.user._id;
        const filePath = req.file.path;
        const fileName = req.file.originalname;
    
        // Extract text from PDF
        const extractedText = await extractTextFromPDF(filePath);
        
        // Process with Gemini LLM
        const transactions = await processWithGemini(extractedText);
        
        // Generate insights
        const insights = await generateInsights(transactions);
        console.log(insights);
        
        // Process dates to ensure they're in proper format
        const processedTransactions = transactions.map(transaction => {
          // Convert the date string to a Date object
          const dateParts = transaction.date.split('-');
          const dateObj = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
          
          return {
            ...transaction,
            date: dateObj,
            amount: parseFloat(transaction.amount)
          };
        });
        
        // Create new statement document
        const statement = new Statement({
          userId,
          fileName,
          filePath,
          transactions: processedTransactions,
          summary: insights.summary,
          suggestions: insights.suggestions
        });
    
        // Save to MongoDB
        await statement.save();
    
        res.status(201).json({
          message: 'Statement processed successfully',
          statementId: statement._id,
          transactions: JSON.stringify(transactions),
          summary: insights.summary,
          suggestions: insights.suggestions
        });
      } catch (error) {
        console.error('Error processing statement:', error);
        res.status(500).json({ error: error.message });
      }
  };

const getAllStatements = async (req, res) => {
  try {
    const userId = req.user._id;
    const statements = await Statement.find(
      {userId}, 
      { fileName: 1, uploadDate: 1, _id: 1 }
    ).sort({ uploadDate: -1 });

    res.status(200).json(statements);
  } catch (error) {
    console.error('Error fetching statements:', error);
    res.status(500).json({ error: error.message });
  }
};

const getStatementById = async (req, res) => {
  try {
    const statement = await Statement.findById(req.params.id);

    if (!statement) {
      return res.status(404).json({ error: 'Statement not found' });
    }

    res.status(200).json(statement);
  } catch (error) {
    console.error('Error fetching statement:', error);
    res.status(500).json({ error: error.message });
  }
};

const statementController = {
    uploadStatement,
    getAllStatements,
    getStatementById
  };
  
  export default statementController;
