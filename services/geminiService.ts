
import { GoogleGenAI } from "@google/genai";

// Fix: Always use the exact initialization pattern as specified in the guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIAssistedReply = async (postTitle: string, postContent: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an experienced blue-collar mentor, provide a helpful and empathetic short comment (in Chinese) for this post:
      Title: ${postTitle}
      Content: ${postContent}`,
      config: {
        systemInstruction: "You are '老王', an experienced and kind worker mentor. Your tone is practical, supportive, and uses common worker slang but remains professional.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "加油兄弟，挺你！";
  }
};
