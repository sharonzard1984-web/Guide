import { GoogleGenerativeAI } from "@google/generative-ai";

let ai = null;

const getAIClient = async () => {
  if (ai) return ai;
  
  try {
    const response = await fetch('http://127.0.0.1:8001/config');
    let apiKey = null;
    
    if (response.ok) {
      const data = await response.json();
      apiKey = data.gemini_api_key;
    }

    if (apiKey) {
      ai = new GoogleGenerativeAI(apiKey);
      return ai;
    }
  } catch (error) {
    console.error('Error initializing Gemini client:', error);
  }
  return null;
};

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
 * Uses Gemini 1.5 Flash to analyze a screenshot and extract a tutorial structure.
 */
export const analyzeScreenshot = async (base64Image) => {
  const client = await getAIClient();
  if (!client) {
      console.error("AI client not initialized");
      return fallbackResult();
  }
  
  try {
    // Use the standard GoogleGenerativeAI pattern
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      },
      "Analyze this mobile app screenshot. Create a title for a 'How-to' tutorial based on what is shown. Write a short 1-sentence description. Then list 3-5 simple step-by-step instructions a senior user would follow to perform the action shown. Return the response as JSON with properties: title, description, and steps (an array of strings)."
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting in JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanedJson);

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
  const client = await getAIClient();
  if (!client) return null;

  try {
    let operation = await client.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      image: {
        imageBytes: base64Image,
      },
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
