const fs = require('fs');

// Read the new cinematic posters
const cinematicPosters = JSON.parse(fs.readFileSync('xainik-cinematic-posters.json', 'utf8'));

// Read the current API file
let apiContent = fs.readFileSync('app/api/feed/route.ts', 'utf8');

// Replace each poster one by one
cinematicPosters.forEach((poster, index) => {
  const posterId = index + 1;
  
  // Find and replace the poster data
  const oldPattern = new RegExp(
    `id: '${posterId}',[\\s\\S]*?created_at: new Date\\(\\)\\.toISOString\\(\\),`,
    'g'
  );
  
  const newPosterData = `id: '${posterId}',
                    slug: '${poster.slug}',
                    title_line: '${poster.title_line}',
                    contrast_line: '${poster.contrast_line}',
                    image_url: '${poster.image_url}',
                    og_image_url: '${poster.og_image_url}',
                    thumb_url: '${poster.thumb_url}',
                    likes: ${poster.likes},
                    views: ${poster.views},
                    shares: ${poster.shares},
                    created_at: new Date().toISOString(),`;
  
  apiContent = apiContent.replace(oldPattern, newPosterData);
});

// Write the updated content back
fs.writeFileSync('app/api/feed/route.ts', apiContent);

console.log('✅ Updated API with cinematic posters');
