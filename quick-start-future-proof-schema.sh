#!/bin/bash

# ============================================================================
# QUICK START - FUTURE-PROOF SCHEMA DEPLOYMENT
# ============================================================================
# This script guides you through deploying the future-proof schema
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "============================================================================"
echo "🚀 QUICK START - FUTURE-PROOF SCHEMA DEPLOYMENT"
echo "============================================================================"
echo "This script will guide you through deploying the bulletproof schema."
echo "Follow the prompts to get your system up and running quickly!"
echo "============================================================================"
echo -e "${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if ! command_exists psql; then
    echo -e "${RED}❌ PostgreSQL client (psql) not found.${NC}"
    echo "Please install PostgreSQL client tools:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql-client"
    echo "  - Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found.${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Get database configuration
echo -e "\n${BLUE}📝 Database Configuration${NC}"
echo "Please provide your database connection details:"

read -p "Database Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database Port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Database Name: " DB_NAME
if [ -z "$DB_NAME" ]; then
    echo -e "${RED}❌ Database name is required${NC}"
    exit 1
fi

read -p "Database User: " DB_USER
if [ -z "$DB_USER" ]; then
    echo -e "${RED}❌ Database user is required${NC}"
    exit 1
fi

read -s -p "Database Password: " DB_PASSWORD
echo ""

# Test connection
echo -e "\n${YELLOW}🔌 Testing database connection...${NC}"
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to database. Please check your credentials.${NC}"
    exit 1
fi

# Set environment variables
export DB_HOST="$DB_HOST"
export DB_PORT="$DB_PORT"
export DB_NAME="$DB_NAME"
export DB_USER="$DB_USER"
export DB_PASSWORD="$DB_PASSWORD"

# Create .env file
echo -e "\n${YELLOW}📁 Creating .env file...${NC}"
cat > .env << EOF
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
EOF
echo -e "${GREEN}✅ .env file created${NC}"

# Confirm deployment
echo -e "\n${BLUE}⚠️  IMPORTANT: This will replace your entire database schema!${NC}"
echo "The migration will:"
echo "  - Drop all existing tables"
echo "  - Create 16 new tables with future-proof architecture"
echo "  - Set up comprehensive security policies"
echo "  - Create performance-optimized indexes"

read -p "Are you sure you want to proceed? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Deployment cancelled. Your database remains unchanged.${NC}"
    exit 0
fi

# Check if this is production
if [ "$DB_HOST" != "localhost" ] && [ "$DB_HOST" != "127.0.0.1" ]; then
    echo -e "\n${RED}⚠️  WARNING: This appears to be a production database!${NC}"
    read -p "Type 'PRODUCTION' to confirm: " prod_confirm
    if [ "$prod_confirm" != "PRODUCTION" ]; then
        echo -e "${RED}Production deployment not confirmed. Exiting.${NC}"
        exit 1
    fi
fi

# Deploy schema
echo -e "\n${BLUE}🚀 Deploying future-proof schema...${NC}"
if ./scripts/deploy-future-proof-schema.sh; then
    echo -e "${GREEN}✅ Schema deployment completed successfully!${NC}"
else
    echo -e "${RED}❌ Schema deployment failed. Check the logs above.${NC}"
    exit 1
fi

# Update codebase
echo -e "\n${BLUE}🔧 Updating codebase for new schema...${NC}"
if node scripts/update-codebase-for-future-proof-schema.js; then
    echo -e "${GREEN}✅ Codebase update completed successfully!${NC}"
else
    echo -e "${RED}❌ Codebase update failed. Check the logs above.${NC}"
    exit 1
fi

# Final success message
echo -e "\n${GREEN}"
echo "============================================================================"
echo "🎉 FUTURE-PROOF SCHEMA DEPLOYMENT COMPLETED!"
echo "============================================================================"
echo "Your system now has a bulletproof, infinitely scalable database architecture!"
echo ""
echo "📁 Files created:"
echo "  - .env (database configuration)"
echo "  - deployment_summary.md (deployment details)"
echo "  - FUTURE_PROOF_SCHEMA_GUIDE.md (codebase update guide)"
echo ""
echo "📚 Next steps:"
echo "1. Review the generated documentation"
echo "2. Update your codebase using the guide"
echo "3. Test all functionality thoroughly"
echo "4. Deploy your application updates"
echo ""
echo "🚀 Your system is now future-proof and ready to scale!"
echo "============================================================================"
echo -e "${NC}"

# Show quick commands
echo -e "\n${BLUE}💡 Quick Commands:${NC}"
echo "  - View deployment summary: cat deployment_summary.md"
echo "  - View update guide: cat FUTURE_PROOF_SCHEMA_GUIDE.md"
echo "  - Check database status: node scripts/update-codebase-for-future-proof-schema.js"
echo "  - Rollback if needed: psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f rollback_*.sql"

echo -e "\n${GREEN}🎯 Congratulations! You now have a bulletproof system!${NC}"
