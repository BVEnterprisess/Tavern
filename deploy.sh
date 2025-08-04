#!/bin/bash

echo "🚀 DEPLOYING TABLE 1837 BAR MANAGEMENT SYSTEM"
echo "================================================"

echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🧹 Cleaning previous build..."
npm run clean
if [ $? -ne 0 ]; then
    echo "❌ Failed to clean previous build"
    exit 1
fi

echo ""
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

echo ""
echo "🔍 Running linting..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed"
    exit 1
fi

echo ""
echo "📊 Analyzing bundle..."
npm run analyze
if [ $? -ne 0 ]; then
    echo "⚠️ Bundle analysis failed, continuing..."
fi

echo ""
echo "🚀 Deploying to Git..."
git add .
git commit -m "Auto-deploy: $(date)"
git push origin main

echo ""
echo "✅ DEPLOYMENT COMPLETE"
echo "================================================"
echo "📍 Live site: https://table1837tavern.bar"
echo "📊 Build status: Check Netlify dashboard"
echo "🔧 Admin tools: Available in /admin"
echo ""