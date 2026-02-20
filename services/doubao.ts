import { PredictionResult, WeatherCondition, DayType } from "../types";

// We now call our own Vercel serverless function
// This avoids CORS issues and keeps the API Key secure on the server
const API_ENDPOINT = "/api/chat";

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
        'Content-Type': 'application/json'
        // No Authorization header needed here, it's handled in /api/chat.js
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Proxy Error:", response.status, errorData);
      return "AI advice currently unavailable (Server/Network Error).";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No advice generated.";
    
  } catch (error) {
    console.error("Network Error:", error);
    return "AI assistant is offline.";
  }
};