#!/bin/bash

# Setup Resend API Key
echo "🔧 Setting up Resend API Key..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
fi

# Check if API key already exists
if grep -q "RESEND_API_KEY" .env.local; then
    echo "🔄 Updating existing RESEND_API_KEY..."
    # Update existing key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/RESEND_API_KEY=.*/RESEND_API_KEY=your_api_key_here/' .env.local
    else
        # Linux
        sed -i 's/RESEND_API_KEY=.*/RESEND_API_KEY=your_api_key_here/' .env.local
    fi
else
    echo "➕ Adding RESEND_API_KEY..."
    echo "" >> .env.local
    echo "# Email Service" >> .env.local
    echo "RESEND_API_KEY=your_api_key_here" >> .env.local
fi

echo ""
echo "✅ Resend API Key placeholder added to .env.local"
echo ""
echo "📋 Next steps:"
echo "1. Get your API key from https://resend.com"
echo "2. Replace 'your_api_key_here' with your actual API key"
echo "3. Restart your development server"
echo ""
echo "🔑 Your API key should look like: re_1234567890abcdef..."
echo ""
echo "🧪 Test the setup:"
echo "curl http://localhost:3003/api/test-email"
