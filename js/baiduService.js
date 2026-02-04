
/**
 * Service to interact with Baidu Qianfan MuseSteamer API for video generation.
 */

/**
 * Generates a video tutorial using the backend server (which calls Baidu MuseSteamer).
 * @param {string} base64Image - The image to use for generation.
 * @param {string} prompt - The text prompt for the video.
 * @returns {Promise<string|null>} - The URL of the generated video or null.
 */
export const generateMuseSteamerVideo = async (base64Image, prompt) => {
  console.log('--- Baidu Video Generation Start (Backend Proxy) ---');
  try {
    const response = await fetch('http://127.0.0.1:8001/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base64_image: base64Image,
        prompt: prompt
      })
    });

    console.log('Backend proxy response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend Proxy Error Text:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('Backend proxy response data:', data);

    if (data.status === 'success' && data.path) {
      const fullUrl = `http://127.0.0.1:8001${data.path}`;
      console.log('Generated Video URL via Proxy:', fullUrl);
      return fullUrl;
    }
    
    return null;

  } catch (error) {
    console.error('Backend Proxy FETCH EXCEPTION:', error);
    return null;
  }
};
