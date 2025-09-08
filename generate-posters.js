const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Runware API configuration
const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;
const RUNWARE_BASE_URL = 'https://api.runware.com/v1';

// Military leadership themes for authentic posters
const militaryThemes = [
  {
    theme: "Leadership Under Pressure",
    context: "Commanding troops in high-stress combat situations",
    focus: "Decision-making, calm under fire, leading by example"
  },
  {
    theme: "Teamwork and Brotherhood", 
    context: "Military unit cohesion and mutual support",
    focus: "Trust, loyalty, shared mission, never leaving anyone behind"
  },
  {
    theme: "Resilience and Perseverance",
    context: "Overcoming adversity and maintaining morale",
    focus: "Mental toughness, bouncing back from setbacks, inspiring others"
  },
  {
    theme: "Discipline and Excellence",
    context: "Maintaining high standards and continuous improvement",
    focus: "Attention to detail, self-discipline, setting the example"
  },
  {
    theme: "Mentorship and Development",
    context: "Developing the next generation of leaders",
    focus: "Teaching, coaching, passing on knowledge and values"
  }
];

async function generatePosterContent(theme) {
  try {
    const prompt = `Create authentic military leadership content for a poster with the theme: "${theme.theme}".

Context: ${theme.context}
Focus: ${theme.focus}

Generate:
1. A powerful, inspiring title line (8-12 words) that captures the essence of military leadership
2. A contrasting tag line (3-5 words) that emphasizes experience over credentials
3. A brief motivational description (2-3 sentences) that would resonate with veterans and military personnel

Make it authentic, powerful, and inspiring. Use military terminology and values. Avoid clichés.

Format as JSON:
{
  "title_line": "your title here",
  "contrast_line": "your tag line here", 
  "description": "your description here"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in military leadership and veteran affairs. Create authentic, inspiring content that resonates with military personnel and veterans."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

async function generatePosterImage(titleLine, theme) {
  try {
    const imagePrompt = `Professional military leadership poster design. ${theme.context}. 

Visual style: Clean, modern, professional military aesthetic. Dark colors with gold/white accents. High contrast, bold typography.

Key elements:
- Strong, confident military leader figure (silhouette or professional photo style)
- Military equipment, symbols, or environment in background
- Professional, inspiring composition
- High quality, poster-worthy design
- 4:5 aspect ratio, portrait orientation

Theme: ${theme.theme}
Message: ${titleLine}

Style: Professional military recruitment poster, motivational leadership poster, clean and powerful design`;

    const response = await fetch(`${RUNWARE_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWARE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        width: 800,
        height: 1000,
        model: "runware-v1",
        num_images: 1,
        guidance_scale: 7.5,
        num_inference_steps: 20
      })
    });

    if (!response.ok) {
      throw new Error(`Runware API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.images[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

async function generateAllPosters() {
  console.log('🎖️ Generating authentic military leadership posters...\n');
  
  const posters = [];
  
  for (let i = 0; i < militaryThemes.length; i++) {
    const theme = militaryThemes[i];
    console.log(`Generating poster ${i + 1}/5: ${theme.theme}`);
    
    try {
      // Generate content
      console.log('  📝 Generating content...');
      const content = await generatePosterContent(theme);
      
      // Generate image
      console.log('  🎨 Generating image...');
      const imageUrl = await generatePosterImage(content.title_line, theme);
      
      // Create poster object
      const poster = {
        id: (i + 1).toString(),
        slug: content.title_line.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        title_line: content.title_line,
        contrast_line: content.contrast_line,
        description: content.description,
        image_url: imageUrl,
        og_image_url: imageUrl,
        thumb_url: imageUrl,
        likes: Math.floor(Math.random() * 100) + 20,
        views: Math.floor(Math.random() * 200) + 100,
        shares: Math.floor(Math.random() * 30) + 5,
        created_at: new Date().toISOString(),
        tags: [theme.theme.toLowerCase().replace(/\s+/g, '-')]
      };
      
      posters.push(poster);
      console.log(`  ✅ Generated: "${content.title_line}"`);
      console.log(`  🖼️  Image: ${imageUrl}\n`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ❌ Error generating poster ${i + 1}:`, error.message);
      // Continue with next poster
    }
  }
  
  return posters;
}

// Main execution
async function main() {
  try {
    const posters = await generateAllPosters();
    
    console.log('🎉 Generated posters:');
    posters.forEach((poster, index) => {
      console.log(`${index + 1}. ${poster.title_line}`);
      console.log(`   ${poster.contrast_line}`);
      console.log(`   Image: ${poster.image_url}\n`);
    });
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('generated-posters.json', JSON.stringify(posters, null, 2));
    console.log('💾 Saved to generated-posters.json');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateAllPosters };
