import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeNewsImpact = async ({ title, description, content }) => {
  const fullText = `${title}\n\n${description}\n\n${content}`;
  const prompt = `Analyze the following news and give a detailed economic impact report with the following format:

1. Summary: One-line summary of the expected economic shift.

2. Industry-Wise Impact:
   Agriculture
   Manufacturing
   Technology & IT
   Finance & Banking
   Real Estate & Construction
   Retail & E-commerce
   Healthcare & Pharma
   Energy & Environment
   Transport & Logistics
   Entertainment & Media
   Education

3. Employment Impact:
   Full-time salaried jobs
   Gig/contract work
   Self-employed/entrepreneurs
   Government/public sector
   Remote/flexible jobs

4. Macroeconomic Effects:
   GDP growth or contraction
   Inflation/deflation trends
   Consumer spending patterns
   Investment outlook
   Currency value changes (if relevant)

5. Short-Term vs Long-Term Outlook:
   0–6 months
   6 months – 3 years
   3+ years

6. Suggested Mitigation or Opportunity Strategies:
   For governments
   For individuals
   For businesses/startups

News: ${fullText}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"  });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini SDK Error:', error.message);
    throw new Error('Failed to generate impact report');
  }
};

export default analyzeNewsImpact;
