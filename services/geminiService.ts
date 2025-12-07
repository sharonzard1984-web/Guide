import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to convert file to Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface AnalysisResult {
  title: string;
  description: string;
  steps: string[];
}

/**
 * Uses Gemini 2.5 Flash to analyze a screenshot and extract a tutorial structure.
 */
export const analyzeScreenshot = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, valid for png too in generic use
              data: base64Image
            }
          },
          {
            text: "Analyze this mobile app screenshot. Create a title for a 'How-to' tutorial based on what is shown. Write a short 1-sentence description. Then list 3-5 simple step-by-step instructions a senior user would follow to perform the action shown."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "steps"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback if API fails
    return {
      title: "New Tutorial",
      description: "A guide based on your screenshot.",
      steps: ["Open the app.", "Locate the item shown.", "Tap to proceed."]
    };
  }
};

/**
 * Uses Veo to generate a short video clip from the image.
 * Note: This requires a paid key and user interaction for the key selection if not present.
 */
export const generateVeoVideo = async (base64Image: string): Promise<string | null> => {
  try {
    // Check for Veo Key permissions
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    // Re-instantiate with potentially new key context if needed, 
    // though the docs say process.env.API_KEY is injected. 
    // We will stick to the global 'ai' instance but good to be aware.

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      image: {
        imageBytes: base64Image,
        mimeType: 'image/jpeg',
      },
      prompt: "Animate this interface to show a user tapping the main button. Educational style, clear visibility.",
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Portrait for mobile
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const videoUri = operation.response.generatedVideos[0].video.uri;
        // Append API key for playback permission
        return `${videoUri}&key=${process.env.API_KEY}`;
    }
    
    return null;

  } catch (error) {
    console.error("Veo Generation Error:", error);
    return null;
  }
};
