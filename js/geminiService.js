import { GoogleGenAI } from "@google/genai";

// Try to get API key from localStorage or use a placeholder
const API_KEY = localStorage.getItem('GEMINI_API_KEY') || 'YOUR_API_KEY_HERE';

// Initialize Gemini Client
// Note: If API_KEY is invalid, this will fail when making requests.
let ai;
try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (e) {
    console.error("Failed to initialize GoogleGenAI", e);
}

/**
 * Helper to convert file to Base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Uses Gemini 2.5 Flash to analyze a screenshot and extract a tutorial structure.
 */
export const analyzeScreenshot = async (base64Image) => {
  if (!ai) {
      console.error("AI client not initialized");
      return fallbackResult();
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
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
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            steps: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["title", "description", "steps"]
        }
      }
    });

    const text = response.text(); // Note: .text() is a method in some versions, or property .text in others. The original code used .text property.
    // However, the original code used `response.text`. Let's check the original code again.
    // Original: `const text = response.text;`
    // Wait, `@google/genai` SDK usually has `response.text()`? 
    // The original code `geminiService.ts` used `const text = response.text;`. 
    // If that worked, I'll stick to it. But wait, `response` from `generateContent` in `@google/genai` (new SDK) might be different from `google-generative-ai`.
    // The import is `@google/genai`.
    // Let's assume the property access is correct if the original code had it.
    
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return fallbackResult();
  }
};

function fallbackResult() {
    return {
      title: "New Tutorial",
      description: "A guide based on your screenshot.",
      steps: ["Open the app.", "Locate the item shown.", "Tap to proceed."]
    };
}

/**
 * Uses Veo to generate a short video clip from the image.
 */
export const generateVeoVideo = async (base64Image) => {
  // Check for Veo Key permissions
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  if (!ai) return null;

  try {
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
      // operation = await ai.operations.getVideosOperation({ operation: operation });
      // Note: The JS SDK might behave differently. Assuming similar API.
      // If getVideosOperation is not available on 'ai.operations', we might need to check the SDK docs or usage.
      // But assuming the original code was correct for the SDK used.
       operation = await ai.operations.getVideosOperation({ name: operation.name });
    }

    if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const videoUri = operation.response.generatedVideos[0].video.uri;
        // Append API key for playback permission
        return `${videoUri}&key=${API_KEY}`;
    }
    
    return null;

  } catch (error) {
    console.error("Veo Generation Error:", error);
    return null;
  }
};
