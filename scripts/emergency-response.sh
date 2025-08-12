#!/bin/bash

# 🚨 EMERGENCY SECURITY RESPONSE SCRIPT
# This script should be run immediately when a security incident is detected

set -e

echo "🚨 EMERGENCY SECURITY RESPONSE INITIATED"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the project root directory"
    exit 1
fi

echo "📋 Step 1: Running security scan..."
npm run security:scan

echo ""
echo "📋 Step 2: Checking for exposed secrets in git history..."
echo "⚠️  If secrets are found in git history, you may need to:"
echo "   - Use BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/"
echo "   - Or use git filter-branch to remove secrets"
echo ""

echo "📋 Step 3: Checking environment files..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    echo "⚠️  Make sure it's not committed to git"
else
    echo "❌ .env.local not found - create it with your environment variables"
fi

echo ""
echo "📋 Step 4: Checking .gitignore..."
if grep -q "\.env\*" .gitignore; then
    echo "✅ .gitignore properly configured for environment files"
else
    echo "❌ .gitignore missing environment file patterns"
fi

echo ""
echo "📋 Step 5: Checking for hardcoded secrets..."
# Check for common secret patterns in source code
if grep -r "eyJ[A-Za-z0-9-_=]\+\.[A-Za-z0-9-_=]\+" src/ scripts/ --exclude-dir=node_modules 2>/dev/null; then
    echo "🚨 WARNING: Potential JWT tokens found in source code!"
else
    echo "✅ No obvious JWT tokens found in source code"
fi

echo ""
echo "📋 Step 6: Checking for API keys..."
if grep -r "sk-[A-Za-z0-9]\{48\}" src/ scripts/ --exclude-dir=node_modules 2>/dev/null; then
    echo "🚨 WARNING: Potential OpenAI API keys found!"
else
    echo "✅ No obvious OpenAI API keys found"
fi

echo ""
echo "📋 Step 7: Checking for Supabase keys..."
if grep -r "SUPABASE_SERVICE_ROLE_KEY" src/ scripts/ --exclude-dir=node_modules | grep -v "process.env" 2>/dev/null; then
    echo "🚨 WARNING: Potential hardcoded Supabase keys found!"
else
    echo "✅ No obvious hardcoded Supabase keys found"
fi

echo ""
echo "🔒 IMMEDIATE ACTIONS REQUIRED:"
echo "1. Rotate ALL exposed API keys and secrets"
echo "2. Update environment variables in all deployment platforms"
echo "3. Check for unauthorized access in your services"
echo "4. Monitor logs for suspicious activity"
echo "5. Update team members about the incident"
echo "6. Document the incident in SECURITY_INCIDENT_RESPONSE.md"
echo ""

echo "📞 EMERGENCY CONTACTS:"
echo "- Supabase Support: https://supabase.com/support"
echo "- Vercel Support: https://vercel.com/support"
echo "- Security Team: [Add your security team contact]"
echo ""

echo "✅ Emergency response script completed"
echo "📝 Review the output above and take immediate action on any issues found"
