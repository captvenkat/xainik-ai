const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = './input-images'; // Directory containing your 40 JPG files
const OUTPUT_DIR = './converted-webp'; // Directory for converted WebP files
const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1350;

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function convertImage(inputPath, outputPath) {
  try {
    console.log(`Converting: ${path.basename(inputPath)}`);
    
    await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 85,
        effort: 6
      })
      .toFile(outputPath);
    
    console.log(`✅ Converted: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error.message);
  }
}

async function convertAllImages() {
  try {
    // Check if input directory exists
    if (!fs.existsSync(INPUT_DIR)) {
      console.error(`❌ Input directory '${INPUT_DIR}' not found!`);
      console.log('\n📁 Please create the input directory and place your 40 JPG files there.');
      console.log('   Example: mkdir input-images && mv *.jpg input-images/');
      return;
    }

    // Get all JPG files
    const files = fs.readdirSync(INPUT_DIR)
      .filter(file => /\.(jpg|jpeg)$/i.test(file))
      .sort();

    if (files.length === 0) {
      console.error(`❌ No JPG files found in '${INPUT_DIR}'`);
      return;
    }

    console.log(`🎯 Found ${files.length} JPG files to convert`);
    console.log(`📏 Target dimensions: ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
    console.log(`💾 Output format: WebP (quality: 85)\n`);

    // Convert each image
    for (const file of files) {
      const inputPath = path.join(INPUT_DIR, file);
      const outputName = file.replace(/\.(jpg|jpeg)$/i, '.webp');
      const outputPath = path.join(OUTPUT_DIR, outputName);
      
      await convertImage(inputPath, outputPath);
    }

    console.log(`\n🎉 Conversion complete!`);
    console.log(`📁 Converted files saved to: ${OUTPUT_DIR}`);
    console.log(`📊 Total files processed: ${files.length}`);
    
    // Show file sizes
    const totalSize = fs.readdirSync(OUTPUT_DIR)
      .reduce((total, file) => {
        const filePath = path.join(OUTPUT_DIR, file);
        const stats = fs.statSync(filePath);
        return total + stats.size;
      }, 0);
    
    console.log(`💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
  }
}

// Run the conversion
convertAllImages();
