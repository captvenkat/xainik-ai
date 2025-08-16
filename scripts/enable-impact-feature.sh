#!/bin/bash

# Enable Impact Analytics Feature
echo "🔧 Enabling Impact Analytics Feature..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
fi

# Check if feature flag already exists
if grep -q "NEXT_PUBLIC_FEATURE_IMPACT" .env.local; then
    echo "🔄 Updating existing feature flag..."
    # Update existing flag
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/NEXT_PUBLIC_FEATURE_IMPACT=.*/NEXT_PUBLIC_FEATURE_IMPACT=true/' .env.local
    else
        # Linux
        sed -i 's/NEXT_PUBLIC_FEATURE_IMPACT=.*/NEXT_PUBLIC_FEATURE_IMPACT=true/' .env.local
    fi
else
    echo "➕ Adding feature flag..."
    echo "" >> .env.local
    echo "# Feature Flags" >> .env.local
    echo "NEXT_PUBLIC_FEATURE_IMPACT=true" >> .env.local
fi

echo "✅ Impact Analytics feature enabled!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your development server"
echo "2. Sign in as a veteran"
echo "3. Navigate to /dashboard/veteran"
echo "4. Click 'Impact Analytics' in the navigation"
echo ""
echo "🌐 Your app is running at: http://localhost:3003"
