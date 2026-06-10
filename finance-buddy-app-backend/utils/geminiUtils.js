// utils/geminiUtils.js
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

let model = null;
if (apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
  } catch (err) {
    console.error("Failed to initialize GoogleGenerativeAI:", err);
  }
}

export const askGemini = async (prompt) => {
  if (!apiKey || !model) {
    console.log("Warning: Google API key not set. Using mock gemini AI response.");
    if (prompt.includes("JSON") || prompt.includes("json")) {
      return JSON.stringify({
        vendor: "Mock AI Vendor",
        amount: 45.67,
        date: new Date().toISOString().split('T')[0],
        category: "food"
      });
    }
    return "This is a mock finance buddy response from Gemini. Set your GOOGLE_API_KEY or GEMINI_API_KEY to chat with the real Gemini model!";
  }
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API call failed, using mock response:", err);
    if (prompt.includes("JSON") || prompt.includes("json")) {
      return JSON.stringify({
        vendor: "Mock AI Vendor (Error Fallback)",
        amount: 45.67,
        date: new Date().toISOString().split('T')[0],
        category: "food"
      });
    }
    return "This is a mock fallback response because the Gemini API call failed. Please check your credentials.";
  }
};

