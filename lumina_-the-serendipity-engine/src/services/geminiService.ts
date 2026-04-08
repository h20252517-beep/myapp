import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SerendipityInsight {
  title: string;
  content: string;
  type: 'quote' | 'prompt' | 'challenge' | 'insight';
  mood: string;
}

export async function generateLuckyInsight(): Promise<SerendipityInsight> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a unique, serendipitous insight. It could be a creative prompt, a profound quote, a small daily challenge, or a surprising fact that inspires wonder. Make it feel 'lucky' and unexpected.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short, catchy title for the insight." },
            content: { type: Type.STRING, description: "The core text of the insight." },
            type: { 
              type: Type.STRING, 
              enum: ['quote', 'prompt', 'challenge', 'insight'],
              description: "The category of the serendipity."
            },
            mood: { type: Type.STRING, description: "A one-word mood associated with this insight (e.g., 'Whimsical', 'Deep', 'Vibrant')." }
          },
          required: ["title", "content", "type", "mood"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text.trim()) as SerendipityInsight;
  } catch (error) {
    console.error("Error generating lucky insight:", error);
    return {
      title: "The Silent Moment",
      content: "Sometimes the luckiest thing is simply having a moment to breathe and notice the light.",
      type: "insight",
      mood: "Calm"
    };
  }
}
