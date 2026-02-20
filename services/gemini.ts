import { GoogleGenAI } from "@google/genai";
import { PredictionResult, WeatherCondition, DayType } from "../types";

// Helper to safely get the API key
// In Vite/Browser environment, process.env is usually undefined. 
// Since we switched to Doubao (Volcengine), this service is largely unused, 
// but we patch it to prevent "process is not defined" errors.
const getApiKey = (): string | undefined => {
  try {
    // Check if process exists (Node) or import.meta.env (Vite)
    return typeof process !== 'undefined' ? process.env?.API_KEY : undefined;
  } catch (e) {
    return undefined;
  }
};

export const getParkingAdvice = async (
  prediction: PredictionResult, 
  time: string, 
  weather: WeatherCondition,
  dayType: DayType
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "AI Assistant is offline (Missing API Key). However, based on the data, parking looks " + (prediction.predictedAvailability > 20 ? "good." : "difficult.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      You are an expert parking management assistant.
      Context:
      - Time: ${time}
      - Weather: ${weather}
      - Day Type: ${dayType}
      - Predicted Available Spots: ${prediction.predictedAvailability} / 200
      - System Recommended Action (Q-Learning): ${prediction.recommendedAction}
      
      Task: Provide a concise (max 2 sentences) advice for a driver looking for parking right now. Then, provide 1 sentence of advice for the parking lot manager.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Unable to generate advice at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI analysis temporarily unavailable.";
  }
};