const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Xainik Poster Generation Framework
const XAINIK_FRAMEWORK = {
  // Approved tags for military leadership themes
  approvedTags: [
    "motivation", "leadership", "teamwork", "crisis", "transition", 
    "resilience", "mentorship", "innovation", "values", "discipline", "performance"
  ],
  
  // Fixed anchor line - never changes
  anchorLine: "Experience. Not certificates.",
  
  // Military leadership themes for poster generation
  themes: [
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
  ]
};

async function generatePosterTitle(theme) {
  try {
    const prompt = `Generate a cinematic poster title for Xainik military leadership platform.

Requirements:
- Title Line: ≤ 8 words, achievement statement, movie tagline style, sentence case
- Tags: 3-5 keywords from: motivation, leadership, teamwork, crisis, transition, resilience, mentorship, innovation, values, discipline, performance

Theme: ${theme.theme}
Context: ${theme.context}

Respond ONLY with valid JSON:
{"title_line": "your title here", "tags": ["tag1", "tag2", "tag3"]}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in military leadership and veteran affairs. Create authentic, cinematic, rebellious content that resonates with military personnel and veterans. Focus on lived experiences and achievements."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating poster title:', error);
    throw error;
  }
}

async function generatePosterImage(titleLine, tags) {
  try {
    // Create tag keywords for the image prompt
    const tagKeywords = tags.join(", ");
    
    const imagePrompt = `A cinematic digital painting of a military-inspired scene, abstract and symbolic, no faces, no insignia, no logos. 
The mood should be larger than life, stormy, cinematic lighting, poster style. 
Use a vertical poster format (1024x1536). 
Style: dramatic, epic, timeless. 
Include elements that evoke ${tagKeywords} without text or logos. 
Ultra high resolution, sharp, detailed.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      size: "1024x1792", // 4:5 aspect ratio for poster
      quality: "hd",
      n: 1,
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

async function generateXainikPosters() {
  console.log('🎨 Generating Xainik cinematic military leadership posters...\n');
  
  const posters = [];
  
  for (let i = 0; i < XAINIK_FRAMEWORK.themes.length; i++) {
    const theme = XAINIK_FRAMEWORK.themes[i];
    
    console.log(`Generating poster ${i + 1}/5: ${theme.theme}`);
    
    try {
      // Generate cinematic title and tags
      console.log('  📝 Generating cinematic title...');
      const titleData = await generatePosterTitle(theme);
      
      // Generate cinematic image
      console.log('  🎨 Generating cinematic image...');
      const imageUrl = await generatePosterImage(titleData.title_line, titleData.tags);
      
      // Create poster object following Xainik framework
      const poster = {
        id: (i + 1).toString(),
        slug: titleData.title_line.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        title_line: titleData.title_line,
        contrast_line: XAINIK_FRAMEWORK.anchorLine, // Fixed anchor line
        description: `Cinematic military leadership poster: ${titleData.title_line}`,
        image_url: imageUrl,
        og_image_url: imageUrl, // Will be cropped to 1200x630
        thumb_url: imageUrl, // Will be resized to 512x512
        likes: Math.floor(Math.random() * 100) + 20,
        views: Math.floor(Math.random() * 200) + 100,
        shares: Math.floor(Math.random() * 30) + 5,
        created_at: new Date().toISOString(),
        tags: titleData.tags
      };
      
      posters.push(poster);
      console.log(`  ✅ Generated: "${titleData.title_line}"`);
      console.log(`  🏷️  Tags: ${titleData.tags.join(', ')}`);
      console.log(`  🖼️  Image: ${imageUrl}\n`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    const posters = await generateXainikPosters();
    
    console.log('🎉 Generated Xainik cinematic posters:');
    posters.forEach((poster, index) => {
      console.log(`${index + 1}. ${poster.title_line}`);
      console.log(`   ${poster.contrast_line}`);
      console.log(`   Tags: ${poster.tags.join(', ')}`);
      console.log(`   Image: ${poster.image_url}\n`);
    });
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('xainik-cinematic-posters.json', JSON.stringify(posters, null, 2));
    console.log('💾 Saved to xainik-cinematic-posters.json');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateXainikPosters, XAINIK_FRAMEWORK };
