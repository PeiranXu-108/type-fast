#!/bin/bash

echo "🚀 Starting Type Fast typing practice app..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting development server..."
npm run dev

echo "✅ App started!"
echo "🌍 Please open your browser and visit: http://localhost:3001"
