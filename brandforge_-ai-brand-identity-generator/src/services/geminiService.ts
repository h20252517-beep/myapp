import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BrandPalette {
  hex: string;
  name: string;
  usage: string;
}

export interface BrandTypography {
  headerFont: string;
  bodyFont: string;
  reasoning: string;
}

export interface BrandIdentity {
  companyName: string;
  missionStatement: string;
  palette: BrandPalette[];
  typography: BrandTypography;
  logoPrompts: {
    primary: string;
    secondary: string[];
  };
  brandVoice: string;
}

export async function generateBrandIdentity(mission: string): Promise<BrandIdentity> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate a comprehensive brand identity for a company with the following mission: "${mission}". 
    The identity should include a company name (if not provided), a refined mission statement, a 5-color palette with names and usage notes, 
    Google Font pairings (header and body), and detailed prompts for generating a primary logo and secondary marks. 
    Also define the brand voice.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          companyName: { type: Type.STRING },
          missionStatement: { type: Type.STRING },
          palette: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING, description: "Hex code including #" },
                name: { type: Type.STRING },
                usage: { type: Type.STRING, description: "How to use this color in the brand" }
              },
              required: ["hex", "name", "usage"]
            }
          },
          typography: {
            type: Type.OBJECT,
            properties: {
              headerFont: { type: Type.STRING, description: "A Google Font name for headers" },
              bodyFont: { type: Type.STRING, description: "A Google Font name for body text" },
              reasoning: { type: Type.STRING }
            },
            required: ["headerFont", "bodyFont", "reasoning"]
          },
          logoPrompts: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING, description: "Detailed prompt for a primary logo" },
              secondary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Prompts for secondary marks or icons"
              }
            },
            required: ["primary", "secondary"]
          },
          brandVoice: { type: Type.STRING }
        },
        required: ["companyName", "missionStatement", "palette", "typography", "logoPrompts", "brandVoice"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateLogo(prompt: string, size: "1K" | "2K" | "4K" = "1K"): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [{ text: `Professional minimalist logo design: ${prompt}. Clean lines, vector style, high contrast, white background.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function chatRefinement(history: ChatMessage[], message: string, brand: BrandIdentity): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are a professional brand consultant. You are helping a user refine their brand identity: ${JSON.stringify(brand)}. 
      Be helpful, creative, and professional. Suggest improvements or explain design choices.`
    },
    history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
