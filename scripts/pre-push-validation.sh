#!/bin/bash

# Pre-push validation script
# This script runs before pushing to ensure code quality

echo "🔍 Running pre-push validation..."

# Check TypeScript errors
echo "📝 Checking TypeScript errors..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before pushing."
    exit 1
fi

# Check build
echo "🏗️ Checking build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the issues before pushing."
    exit 1
fi

echo "✅ Pre-push validation passed!"
echo "🚀 Ready to push!"
