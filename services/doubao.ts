import { PredictionResult, WeatherCondition, DayType } from "../types";

// Note: In production, use process.env.REACT_APP_ARK_API_KEY
// For this deployment test, we use the provided key directly.
const API_KEY = "baeac3bb-34b5-4033-bba4-b9defd1113cb";
const MODEL_ID = "doubao-seed-1-6-251015";
// Using the standard OpenAI-compatible endpoint for Volcengine Ark
const API_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export const getParkingAdvice = async (
  prediction: PredictionResult, 
  time: string, 
  weather: WeatherCondition, 
  dayType: DayType
): Promise<string> => {
  const systemPrompt = `You are an expert parking management assistant. Provide concise, helpful advice.`;
  
  const userPrompt = `
    Context:
    - Time: ${time}
    - Weather: ${weather}
    - Day Type: ${dayType}
    - Predicted Available Spots: ${prediction.predictedAvailability} / 200
    - System Recommended Action: ${prediction.recommendedAction}
    
    Task: Provide a concise (max 2 sentences) advice for a driver looking for parking right now.
  `;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Volcengine API Error:", response.status, errorData);
      return "AI advice currently unavailable (Network/API Error).";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No advice generated.";
    
  } catch (error) {
    console.error("Network Error:", error);
    return "AI assistant is offline.";
  }
};