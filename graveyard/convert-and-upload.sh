#!/bin/bash

echo "🎯 Xainik Military Backgrounds Conversion & Upload Script"
echo "========================================================"
echo ""

# Check if Node.js and Sharp are available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! node -e "require('sharp')" &> /dev/null; then
    echo "❌ Sharp is not installed. Installing Sharp..."
    npm install sharp
fi

echo "✅ Dependencies check passed"
echo ""

# Step 1: Create input directory
echo "📁 Step 1: Preparing input directory"
if [ ! -d "input-images" ]; then
    mkdir input-images
    echo "   Created input-images directory"
else
    echo "   input-images directory already exists"
fi

echo ""
echo "📋 Please place your 40 JPG files in the 'input-images' directory"
echo "   Then press Enter to continue..."
read -p "   Press Enter when ready... " -r

# Step 2: Check if files are present
echo ""
echo "📁 Step 2: Checking input files"
jpg_count=$(find input-images -name "*.jpg" -o -name "*.jpeg" | wc -l)

if [ $jpg_count -eq 0 ]; then
    echo "❌ No JPG files found in input-images directory"
    echo "   Please add your JPG files and run the script again"
    exit 1
fi

echo "✅ Found $jpg_count JPG files"
echo ""

# Step 3: Convert to WebP
echo "🔄 Step 3: Converting JPG to WebP"
echo "   This will resize images to 1080x1350 and convert to WebP format"
echo "   Quality: 85, Effort: 6 (good balance of quality vs file size)"
echo ""

node convert-military-backgrounds.js

# Step 4: Check conversion results
echo ""
echo "📁 Step 4: Checking conversion results"
if [ -d "military-backgrounds" ]; then
    webp_count=$(find military-backgrounds -name "*.webp" | wc -l)
    echo "✅ Successfully converted $webp_count images to WebP"
    
    # Show file sizes
    total_size=$(du -sh military-backgrounds | cut -f1)
    echo "💾 Total size: $total_size"
    
    echo ""
    echo "📋 Converted files:"
    find military-backgrounds -name "*.webp" | sort | head -10
    if [ $webp_count -gt 10 ]; then
        echo "   ... and $((webp_count - 10)) more files"
    fi
else
    echo "❌ Conversion failed - military-backgrounds directory not found"
    exit 1
fi

echo ""
echo "🚀 Step 5: Upload to Supabase Storage"
echo "====================================="
echo ""
echo "📋 Next steps:"
echo "   1. Go to your Supabase dashboard"
echo "   2. Navigate to Storage > Buckets"
echo "   3. Create a bucket called 'backgrounds' if it doesn't exist"
echo "   4. Create a folder called 'military' inside the backgrounds bucket"
echo "   5. Upload all the .webp files from the 'military-backgrounds' directory"
echo "   6. Set the bucket to public (if you want direct access)"
echo ""
echo "🔗 Supabase Storage URL format will be:"
echo "   https://[PROJECT_ID].supabase.co/storage/v1/object/public/backgrounds/military/[FILENAME]"
echo ""
echo "📝 After uploading, update your environment variables:"
echo "   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co"
echo "   SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]"
echo ""
echo "🎉 Conversion complete! Your military backgrounds are ready for Xainik."
echo ""
echo "💡 Tip: You can now delete the 'input-images' and 'military-backgrounds' directories"
echo "   to save space, as the images are now in Supabase Storage."
