#!/bin/bash

# Quick Start Script for Veteran Dashboard Database Setup
# This script helps you test and validate your database setup

echo "🚀 Veteran Dashboard Database Setup"
echo "============================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo ""
    echo "Please create a .env.local file with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo ""
    echo "You can find these in your Supabase dashboard under Settings > API"
    exit 1
fi

# Check if required packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing required packages..."
    npm install @supabase/supabase-js dotenv
fi

echo "✅ Environment check passed"
echo ""

echo "📋 Available Actions:"
echo "1. Run database diagnostic (SQL)"
echo "2. Run database tests (Node.js)"
echo "3. View deployment guide"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔍 Database Diagnostic Instructions:"
        echo "============================================================"
        echo ""
        echo "1. Go to your Supabase Dashboard"
        echo "2. Navigate to SQL Editor"
        echo "3. Copy the contents of 'comprehensive_database_check.sql'"
        echo "4. Paste and run the SQL"
        echo "5. Review the diagnostic output"
        echo ""
        echo "This will show you:"
        echo "   ✅ Which tables exist/missing"
        echo "   ✅ Foreign key relationships"
        echo "   ✅ RLS policies"
        echo "   ✅ Data integrity status"
        echo ""
        echo "If issues are found, run 'proper_migration.sql' next"
        ;;
    2)
        echo ""
        echo "🧪 Running Database Tests..."
        echo "============================================================"
        echo ""
        node scripts/test-database-setup.js
        ;;
    3)
        echo ""
        echo "📖 Deployment Guide:"
        echo "============================================================"
        echo ""
        echo "1. Run comprehensive_database_check.sql first"
        echo "2. If issues found, run proper_migration.sql"
        echo "3. Run the diagnostic again to confirm success"
        echo "4. Test your veteran dashboard features"
        echo ""
        echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-4."
        exit 1
        ;;
esac

echo ""
echo "============================================================"
echo "🎉 Setup complete! Your veteran dashboard database is ready."
echo "============================================================"
