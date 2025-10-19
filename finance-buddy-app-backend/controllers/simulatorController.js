// controllers/simulatorController.js
import { getGeminiPrediction } from '../utils/gemini.js';

export const simulateScenario = async (req, res) => {
  try {
    const { scenario } = req.body;
    if (!scenario) return res.status(400).json({ error: 'Scenario is required' });

    const prompt = `
You are a highly analytical economics and finance expert. A user will describe a hypothetical financial or policy scenario. Your task is to analyze the impacts across various industries, employment types, and economic sectors.

For the scenario:

"${scenario}"

Return a structured, comprehensive analysis with these sections:

Please respond in clear sections using markdown-style headings.


Provide a clear and realistic prediction of the financial consequences, including possible gains/losses, risks, and tips. Keep it concise and helpful.
Return the response in json format.
`;

    const response = await getGeminiPrediction(prompt);

    res.status(200).json({ prediction: response });
  } catch (error) {
    console.error('Simulation error:', error.message);
    res.status(500).json({ error: 'Failed to simulate scenario' });
  }
};
