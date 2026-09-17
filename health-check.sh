#!/bin/bash

# Smart Retail - System Health Check
# This script verifies that everything is set up correctly

echo "🔍 Smart Retail - System Health Check"
echo "======================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js v16 or higher"
    ISSUES=$((ISSUES + 1))
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    ISSUES=$((ISSUES + 1))
fi

# Check MongoDB
echo "🍃 Checking MongoDB..."
if command -v mongod &> /dev/null; then
    MONGO_VERSION=$(mongod --version | head -n 1)
    echo -e "${GREEN}✓${NC} MongoDB installed"
    
    # Check if MongoDB is running
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✓${NC} MongoDB is running"
    else
        echo -e "${YELLOW}⚠${NC} MongoDB is not running. Start it with: brew services start mongodb-community"
    fi
else
    echo -e "${RED}✗${NC} MongoDB not found. Please install MongoDB"
    ISSUES=$((ISSUES + 1))
fi

echo ""
echo "📂 Checking project structure..."

# Check backend files
if [ -d "backend" ]; then
    echo -e "${GREEN}✓${NC} Backend directory exists"
    
    if [ -f "backend/package.json" ]; then
        echo -e "${GREEN}✓${NC} Backend package.json exists"
    else
        echo -e "${RED}✗${NC} Backend package.json not found"
        ISSUES=$((ISSUES + 1))
    fi
    
    if [ -f "backend/server.js" ]; then
        echo -e "${GREEN}✓${NC} Backend server.js exists"
    else
        echo -e "${RED}✗${NC} Backend server.js not found"
        ISSUES=$((ISSUES + 1))
    fi
    
    if [ -f "backend/.env" ]; then
        echo -e "${GREEN}✓${NC} Backend .env exists"
    else
        echo -e "${YELLOW}⚠${NC} Backend .env not found. Create from .env.example"
    fi
    
    # Check if backend dependencies are installed
    if [ -d "backend/node_modules" ]; then
        echo -e "${GREEN}✓${NC} Backend dependencies installed"
    else
        echo -e "${YELLOW}⚠${NC} Backend dependencies not installed. Run: cd backend && npm install"
    fi
else
    echo -e "${RED}✗${NC} Backend directory not found"
    ISSUES=$((ISSUES + 1))
fi

# Check frontend files
if [ -d "frontend" ]; then
    echo -e "${GREEN}✓${NC} Frontend directory exists"
    
    if [ -f "frontend/package.json" ]; then
        echo -e "${GREEN}✓${NC} Frontend package.json exists"
    else
        echo -e "${RED}✗${NC} Frontend package.json not found"
        ISSUES=$((ISSUES + 1))
    fi
    
    if [ -f "frontend/index.html" ]; then
        echo -e "${GREEN}✓${NC} Frontend index.html exists"
    else
        echo -e "${RED}✗${NC} Frontend index.html not found"
        ISSUES=$((ISSUES + 1))
    fi
    
    # Check if frontend dependencies are installed
    if [ -d "frontend/node_modules" ]; then
        echo -e "${GREEN}✓${NC} Frontend dependencies installed"
    else
        echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed. Run: cd frontend && npm install"
    fi
else
    echo -e "${RED}✗${NC} Frontend directory not found"
    ISSUES=$((ISSUES + 1))
fi

# Check documentation
echo ""
echo "📚 Checking documentation..."
[ -f "README.md" ] && echo -e "${GREEN}✓${NC} README.md exists" || echo -e "${YELLOW}⚠${NC} README.md not found"
[ -f "QUICKSTART.md" ] && echo -e "${GREEN}✓${NC} QUICKSTART.md exists" || echo -e "${YELLOW}⚠${NC} QUICKSTART.md not found"
[ -f "DEMO_GUIDE.md" ] && echo -e "${GREEN}✓${NC} DEMO_GUIDE.md exists" || echo -e "${YELLOW}⚠${NC} DEMO_GUIDE.md not found"

echo ""
echo "======================================"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ System check passed!${NC}"
    echo ""
    echo "🚀 You're ready to start the application:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd backend && npm run dev"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd frontend && npm run dev"
    echo ""
    echo "Then visit: http://localhost:5173"
else
    echo -e "${RED}❌ Found $ISSUES issue(s). Please resolve them before starting.${NC}"
fi

echo ""
