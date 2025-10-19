// utils/geminiUtils.js
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const askGemini = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};
