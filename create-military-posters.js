const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// High-quality military images from Unsplash
const militaryImages = [
  {
    url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=1000&fit=crop",
    theme: "Leadership Under Pressure"
  },
  {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1000&fit=crop", 
    theme: "Teamwork and Brotherhood"
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
    theme: "Resilience and Perseverance"
  },
  {
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=1000&fit=crop",
    theme: "Discipline and Excellence"
  },
  {
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop",
    theme: "Mentorship and Development"
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

async function generateAllPosters() {
  console.log('🎖️ Generating authentic military leadership posters...\n');
  
  const posters = [];
  
  for (let i = 0; i < militaryThemes.length; i++) {
    const theme = militaryThemes[i];
    const image = militaryImages[i];
    
    console.log(`Generating poster ${i + 1}/5: ${theme.theme}`);
    
    try {
      // Generate content
      console.log('  📝 Generating content...');
      const content = await generatePosterContent(theme);
      
      // Use high-quality military image
      const imageUrl = image.url;
      
      // Create poster object
      const poster = {
        id: (i + 1).toString(),
        slug: content.title_line.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        title_line: content.title_line,
        contrast_line: content.contrast_line,
        description: content.description,
        image_url: imageUrl,
        og_image_url: imageUrl.replace('w=800&h=1000', 'w=1200&h=630'),
        thumb_url: imageUrl.replace('w=800&h=1000', 'w=400&h=500'),
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