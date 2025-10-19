import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeOCRText = async (ocrText) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
You are an AI assistant helping with expense tracking.
Given the following OCR scanned text from a bill or invoice, extract:
- Total Amount Spent
- Date of Purchase
- Vendor/Store Name
- Category of Expense (e.g., Grocery, Dining, Travel, Shopping, etc.)
- Items purchased
- Place of expense

OCR Text:
"${ocrText}"

Respond in this JSON format exactly:
{
  "amount": "amount_value",
  "date": "date_value in the format DD-MM-YYYY",
  "vendor": "vendor_name",
  "category": "expense_category",
  "items":"items_purchased"
  "Place": "place_of_expense"
}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  let aiText = response.text(); // calling the text function
  aiText = aiText.trim();
  
  // Remove code block markers if present
  if (aiText.startsWith("```")) {
    aiText = aiText.replace(/```.*?\n/, '').replace(/```$/, '');
  }
  
  console.log(aiText)

  const parsed = JSON.parse(aiText);
  return parsed;
};