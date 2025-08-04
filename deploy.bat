@echo off
echo 🚀 DEPLOYING TABLE 1837 BAR MANAGEMENT SYSTEM
echo ================================================

echo.
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo.
echo 🧹 Cleaning previous build...
call npm run clean
if %errorlevel% neq 0 (
    echo ❌ Failed to clean previous build
    exit /b 1
)

echo.
echo 🔨 Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    exit /b 1
)

echo.
echo 🧪 Running tests...
call npm test
if %errorlevel% neq 0 (
    echo ❌ Tests failed
    exit /b 1
)

echo.
echo 🔍 Running linting...
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ Linting failed
    exit /b 1
)

echo.
echo 📊 Analyzing bundle...
call npm run analyze
if %errorlevel% neq 0 (
    echo ⚠️ Bundle analysis failed, continuing...
)

echo.
echo 🚀 Deploying to Git...
git add .
git commit -m "Auto-deploy: $(date /t) $(time /t)"
git push origin main

echo.
echo ✅ DEPLOYMENT COMPLETE
echo ================================================
echo 📍 Live site: https://table1837tavern.bar
echo 📊 Build status: Check Netlify dashboard
echo 🔧 Admin tools: Available in /admin
echo.