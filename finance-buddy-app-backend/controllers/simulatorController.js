// controllers/simulatorController.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "MOCK_KEY";
const genAI = new GoogleGenerativeAI(apiKey);
const isMock = apiKey === "MOCK_KEY";

export const simulateScenario = async (req, res) => {
  try {
    const { scenario } = req.body;
    if (!scenario) return res.status(400).json({ error: 'Scenario is required' });

    if (isMock) {
      return res.status(200).json({
        prediction: {
          analysis: {
            scenario: scenario,
            sections: [
              {
                heading: "Immediate Economic Impact",
                content: `In response to the scenario: "${scenario}", the immediate impact would be marked by increased market uncertainty, reallocation of capital, and short-term adjustment costs across primary sectors.`
              },
              {
                heading: "Affected Industries & Jobs",
                content: "Tech, financial services, and retail sectors would adapt by accelerating digital adoption. Job roles related to data analysis, risk management, and operations efficiency will see heightened demand, while legacy manual roles might face contraction."
              },
              {
                heading: "Long-term Outlook",
                content: "Over the next 3 to 5 years, this scenario will likely lead to institutionalization of new regulatory frameworks, stabilization of consumer spending, and the emergence of new, resilient business models optimized for these conditions."
              }
            ]
          }
        }
      });
    }

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
