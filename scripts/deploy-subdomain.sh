#!/bin/bash

# Deploy Subdomain Changes to Vercel
echo "🚀 Deploying subdomain changes to Vercel..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first."
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging changes..."
    git add .
    
    echo "💾 Committing changes..."
    git commit -m "Add noreply.xainik.org subdomain page and configuration"
    
    echo "📤 Pushing to remote..."
    git push origin $CURRENT_BRANCH
else
    echo "✅ No changes to commit"
fi

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Wait for Vercel to build and deploy (usually 2-5 minutes)"
echo "2. Add DNS records in your domain registrar:"
echo "   - Type: CNAME"
echo "   - Name: noreply"
echo "   - Value: cname.vercel-dns.com"
echo "3. Add domain in Vercel dashboard:"
echo "   - Go to your project settings"
echo "   - Navigate to Domains"
echo "   - Add: noreply.xainik.org"
echo ""
echo "🔗 Once deployed, visit: https://noreply.xainik.org"
echo ""
echo "📚 For detailed setup instructions, see: SUBDOMAIN_SETUP_GUIDE.md"
