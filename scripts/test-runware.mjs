/**
 * Test Runware API connection and generate a single image
 */

// Test Runware API directly
const RUNWARE_API_URL = "https://api.runware.com/v1";
const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;

async function generateImageWithRunware(prompt, title) {
  console.log(`🎨 Generating image for: "${title}"`);
  
  const response = await fetch(`${RUNWARE_API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RUNWARE_API_KEY}`
    },
    body: JSON.stringify({
      prompt: prompt,
      width: 1024,
      height: 1024,
      num_images: 1,
      model: "runware-sdxl-1.0",
      style: "cinematic",
      quality: "high"
    })
  });

  if (!response.ok) {
    throw new Error(`Runware API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.images || data.images.length === 0) {
    throw new Error('No images returned from Runware API');
  }

  return data.images[0].url;
}

async function testRunware() {
  console.log('🧪 Testing Runware API connection...');
  
  try {
    const testPrompt = {
      title: "Test Image",
      prompt: "A cinematic digital painting of a military leader silhouetted against a stormy night sky, dramatic lighting, no faces visible, abstract and symbolic, poster style, square format 1024x1024, ultra high resolution, sharp, detailed, cinematic mood, epic heroic atmosphere"
    };
    
    const imageUrl = await generateImageWithRunware(testPrompt.prompt, testPrompt.title);
    
    console.log('✅ Runware API test successful!');
    console.log('📸 Generated image URL:', imageUrl);
    
    // Test downloading the image
    const response = await fetch(imageUrl);
    if (response.ok) {
      console.log('✅ Image download test successful!');
      console.log('📊 Image size:', response.headers.get('content-length'), 'bytes');
    } else {
      console.log('❌ Image download failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Runware API test failed:', error.message);
    console.error('💡 Make sure RUNWARE_API_KEY is set in your environment variables');
  }
}

testRunware();
