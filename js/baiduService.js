
/**
 * Service to interact with Baidu Qianfan MuseSteamer API for video generation.
 */

const getApiKey = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8001/config');
    if (response.ok) {
      const data = await response.json();
      return data.baidu_api_key;
    }
  } catch (error) {
    console.error('Error fetching API key:', error);
  }
  return null;
};

/**
 * Generates a video tutorial using Baidu MuseSteamer.
 * @param {string} base64Image - The image to use for generation.
 * @param {string} prompt - The text prompt for the video.
 * @returns {Promise<string|null>} - The URL of the generated video or null.
 */
export const generateMuseSteamerVideo = async (base64Image, prompt) => {
  try {
    const API_KEY = await getApiKey();
    const response = await fetch('https://qianfan.baidubce.com/video/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "musesteamer-2.0-turbo-i2v",
        content: [
          {
            type: "text",
            text: prompt || "Create a helpful video tutorial based on this screenshot."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Baidu MuseSteamer Error:', error);
      return null;
    }

    const data = await response.json();
    const taskId = data.task_id || data.id || (data.result && data.result.task_id);

    if (!taskId) {
      // If it returned the URL immediately
      return data.video_url || data.result?.video_url || null;
    }

    // Polling for completion
    console.log(`Polling Baidu task: ${taskId}`);
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes with 10s intervals
    
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 10000)); // Poll every 10 seconds
      attempts++;

      const pollResponse = await fetch(`https://qianfan.baidubce.com/video/generations/${taskId}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      if (pollResponse.ok) {
        const pollData = await pollResponse.json();
        const status = pollData.status || pollData.task_status;
        
        if (status === 'success' || status === 'completed') {
          return pollData.video_url || pollData.result?.video_url;
        } else if (status === 'failed' || status === 'error') {
          console.error('Baidu video generation failed:', pollData);
          return null;
        }
        console.log(`Still processing: ${status}...`);
      }
    }

    console.error('Baidu MuseSteamer generation timed out');
    return null;

  } catch (error) {
    console.error('Baidu MuseSteamer Exception:', error);
    return null;
  }
};
