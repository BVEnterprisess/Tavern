# 🤖 Auto-Sync Manager for Table 1837

## Overview
The Auto-Sync Manager automatically stages, commits, and pushes code changes every 5 minutes, ensuring your code is always synchronized across all devices.

## 🚀 Quick Start

### Option 1: Using npm scripts
```bash
npm run auto-sync
```

### Option 2: Using Windows Batch File
```bash
start-auto-sync.bat
```

### Option 3: Using PowerShell Script
```powershell
.\start-auto-sync.ps1
```

### Option 4: Direct Node.js execution
```bash
node auto-sync-every-5min.js
```

## 📋 What It Does

The Auto-Sync Manager performs the following steps every 5 minutes:

1. **🔍 Check for Changes** - Detects if any files have been modified
2. **📦 Install Dependencies** - Runs `npm install` to ensure all dependencies are up to date
3. **🧹 Clean Build** - Runs `npm run clean` to remove old build files
4. **🔨 Build Project** - Runs `npm run build` to create production-ready files
5. **📝 Stage Changes** - Adds all changes to git staging area
6. **💾 Commit Changes** - Creates a commit with detailed information about changed files
7. **🚀 Push to Remote** - Pushes changes to the main branch

## 📊 Features

- **🔄 Automatic Detection** - Only syncs when changes are detected
- **📝 Detailed Logging** - All activities are logged to `auto-sync.log`
- **🛡️ Error Handling** - Graceful error handling with detailed error messages
- **📈 Statistics Tracking** - Tracks successful syncs and errors
- **⏰ Configurable Interval** - Easy to modify sync frequency (currently 5 minutes)
- **🛑 Graceful Shutdown** - Proper cleanup when stopped with Ctrl+C

## 📁 Files Created

- `auto-sync-every-5min.js` - Main auto-sync script
- `start-auto-sync.bat` - Windows batch file for easy startup
- `start-auto-sync.ps1` - PowerShell script with enhanced error handling
- `auto-sync.log` - Log file (created automatically when running)

## 🔧 Configuration

### Changing Sync Interval
Edit `auto-sync-every-5min.js` and modify this line:
```javascript
this.syncInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
```

### Custom Commit Messages
The script generates commit messages automatically, but you can modify the `getCommitMessage()` method to customize the format.

## 📊 Monitoring

### Check Status
```bash
npm run auto-sync:status
```

### View Logs
```bash
# View recent logs
tail -f auto-sync.log

# View all logs
cat auto-sync.log
```

## 🛠️ Troubleshooting

### Common Issues

1. **Node.js not found**
   - Install Node.js from https://nodejs.org/
   - Ensure it's in your PATH

2. **Git not configured**
   - Set up git user: `git config --global user.name "Your Name"`
   - Set up git email: `git config --global user.email "your.email@example.com"`

3. **Permission errors**
   - Run as administrator on Windows
   - Ensure you have write permissions to the project directory

4. **Build failures**
   - Check the log file for specific error messages
   - Ensure all dependencies are properly installed

### Stopping the Auto-Sync

- **Ctrl+C** - Graceful shutdown
- **Close terminal** - Process will stop
- **Task Manager** - Force stop if needed (Windows)

## 🔒 Security Notes

- The auto-sync script runs with the same permissions as your user account
- It will commit and push ALL changes in the repository
- Ensure sensitive files are in `.gitignore` before starting
- Review commits before pushing to production

## 📈 Performance

- **Memory Usage**: ~50MB (Node.js process)
- **CPU Usage**: Minimal (only runs every 5 minutes)
- **Disk Usage**: Log file grows over time (rotate if needed)
- **Network**: Only uses bandwidth when changes are detected

## 🎯 Best Practices

1. **Start Early** - Begin auto-sync at the start of your development session
2. **Monitor Logs** - Check `auto-sync.log` regularly for any issues
3. **Review Commits** - Occasionally review the commit history to ensure quality
4. **Backup** - Keep regular backups of your repository
5. **Test First** - Ensure your build process works before starting auto-sync

## 🚨 Important Notes

- **Always commit manually for important changes** - Don't rely solely on auto-sync for critical updates
- **Review before production** - Auto-sync is for development convenience, not production deployment
- **Backup your work** - Keep regular backups of your repository
- **Monitor disk space** - Log files can grow over time

## 📞 Support

If you encounter issues:

1. Check the `auto-sync.log` file for error details
2. Ensure all dependencies are installed: `npm install`
3. Verify git configuration: `git config --list`
4. Test build process manually: `npm run build`

---

**Happy Coding! 🎉** 