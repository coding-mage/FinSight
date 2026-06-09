// controllers/simulatorController.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const simulateScenario = async (req, res) => {
  try {
    const { scenario } = req.body;
    if (!scenario) return res.status(400).json({ error: 'Scenario is required' });

    const prompt = `
You are a highly analytical economics and finance expert. A user will describe a hypothetical financial or policy scenario. Your task is to analyze the impacts across various industries, employment types, and economic sectors.

For the scenario:
"${scenario}"

Return a JSON object containing the structured, comprehensive analysis in this exact format:
{
  "analysis": {
    "scenario": "${scenario}",
    "sections": [
      {
        "heading": "Heading Name",
        "content": "Detailed text content..."
      }
    ]
  }
}
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const parsed = JSON.parse(text.trim());

    res.status(200).json({ prediction: parsed });
  } catch (error) {
    console.error('Simulation error:', error.message);
    res.status(500).json({ error: 'Failed to simulate scenario' });
  }
};
