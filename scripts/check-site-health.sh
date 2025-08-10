#!/bin/bash

# Xainik Site Health Check Script
# This script runs various health checks for the Xainik site

echo "🔍 Xainik Site Health Check"
echo "=========================="

# Check if development server is running
echo "1. Checking if development server is running..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "   ✅ Development server is running on http://localhost:3000"
else
    echo "   ❌ Development server is not running"
    echo "   Please start the server with: npm run dev"
    exit 1
fi

echo ""
echo "2. Running link checker..."
npm run check-links-simple

echo ""
echo "3. Quick page status check..."
pages=("/" "/browse" "/pricing" "/about" "/contact" "/support" "/terms" "/privacy")
for page in "${pages[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$page")
    if [ "$status" = "200" ]; then
        echo "   ✅ $page - OK ($status)"
    else
        echo "   ❌ $page - FAILED ($status)"
    fi
done

echo ""
echo "🏁 Health check complete!"
echo "For detailed link analysis, see: scripts/link-checker-report.md"
