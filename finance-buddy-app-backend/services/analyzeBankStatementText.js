import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeBankStatementText(rawText) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a financial assistant. Extract all expenses from the following bank statement text. 
If anything is not known, please return "Unknown"

Return the output ONLY in pure JSON format as an array like this:

[
  {
  "amount": "accurate_amount_value",
  "date": "date_value in the format DD-MM-YYYY",
  "vendor": "entire_vendor_name",
  "category": "expense_category (e.g., Grocery, Dining, Travel, Shopping, etc.)",
  "items":"items_purchased"
  "Place": "place_of_expense"
}
  ...
]

Text:
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
    return parsedExpenses;
  } catch (err) {
    console.error('Failed to parse AI output:', err);
    throw new Error('Failed to parse AI response as JSON.');
  }
}