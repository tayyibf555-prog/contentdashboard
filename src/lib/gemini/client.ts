import { GoogleGenAI } from "@google/genai";

function getGemini() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

/**
 * Generate a background image using Google Imagen via the Gemini API.
 * Returns base64-encoded PNG string, or null if generation fails.
 */
export async function generateBackground(prompt: string): Promise<string | null> {
  try {
    const ai = getGemini();
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    return imageBytes || null;
  } catch (err) {
    console.error("Gemini background generation failed:", err);
    return null;
  }
}
