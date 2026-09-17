#!/bin/bash

echo "🚀 Starting Smart Retail Application Setup..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    brew services start mongodb-community 2>/dev/null || echo "Please start MongoDB manually"
    sleep 2
fi

echo "📦 Installing Backend Dependencies..."
cd backend
npm install

echo ""
echo "🌱 Seeding Database..."
npm run seed

echo ""
echo "🎨 Installing Frontend Dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Setup Complete!"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then visit: http://localhost:5173"
echo ""
echo "Login Credentials:"
echo "  Admin: admin@smartretail.com / admin123"
echo "  Staff: staff@smartretail.com / staff123"
echo ""
