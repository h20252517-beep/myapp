import { GoogleGenAI, Type } from "@google/genai";

export type Tone = "professional" | "witty" | "urgent";
export type Platform = "linkedin" | "twitter" | "instagram";
export type ImageSize = "1K" | "2K" | "4K";

export interface SocialPost {
  platform: Platform;
  content: string;
  imagePrompt: string;
  aspectRatio: string;
}

// Helper to get AI instance with the latest key
function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function generateSocialContent(idea: string, tone: Tone): Promise<SocialPost[]> {
  const ai = getAI();
  const prompt = `
    Generate social media posts for an idea.
    Idea: ${idea}
    Tone: ${tone}

    Create content for:
    1. LinkedIn: Professional, long-form, insightful.
    2. Twitter/X: Short, punchy, engaging.
    3. Instagram: Visual-focused, catchy caption, relevant hashtags.

    For each platform, also provide a highly descriptive image prompt that captures the essence of the post.
    The image prompt should be detailed and suitable for a high-quality image generator.
    
    Return the result as a JSON array of objects with keys: platform, content, imagePrompt, aspectRatio.
    Platform names must be: "linkedin", "twitter", "instagram".
    Optimal aspect ratios:
    - linkedin: "4:3"
    - twitter: "16:9"
    - instagram: "1:1"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING, enum: ["linkedin", "twitter", "instagram"] },
            content: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            aspectRatio: { type: Type.STRING }
          },
          required: ["platform", "content", "imagePrompt", "aspectRatio"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

export async function generateImage(prompt: string, aspectRatio: string, size: ImageSize): Promise<string | null> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: size as any
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
}
