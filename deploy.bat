@echo off
echo 🚀 Starting deployment process for Table 1837 Bar Management System...

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ Not in a git repository. Please run this from the project root.
    pause
    exit /b 1
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 📍 Current branch: %CURRENT_BRANCH%

REM Stage all changes
echo 📦 Staging all changes...
git add .

REM Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo ✅ No changes to commit. Everything is up to date!
    pause
    exit /b 0
)

REM Get commit message from user or use default
if "%1"=="" (
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
    set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
    set "COMMIT_MESSAGE=Update Table 1837 Bar Management System - %YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"
) else (
    set "COMMIT_MESSAGE=%1"
)

REM Commit changes
echo 💾 Committing changes with message: %COMMIT_MESSAGE%
git commit -m "%COMMIT_MESSAGE%"

REM Push to remote
echo 🚀 Pushing to remote repository...
git push origin %CURRENT_BRANCH%

echo ✅ Deployment initiated! Changes will be automatically deployed to Netlify.
echo 🌐 Check your Netlify dashboard for deployment status.
echo 🔗 Your site: https://table1837tavern.bar
pause 