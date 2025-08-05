#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoSyncManager {
    constructor() {
        this.projectRoot = process.cwd();
        this.logFile = path.join(this.projectRoot, 'auto-sync.log');
        this.isRunning = false;
        this.syncInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.lastSyncTime = null;
        this.syncCount = 0;
        this.errorCount = 0;
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type}] ${message}`;
        
        console.log(logEntry);
        
        // Append to log file
        fs.appendFileSync(this.logFile, logEntry + '\n');
    }

    async executeCommand(command, description) {
        try {
            this.log(`🔄 Executing: ${description}`);
            const result = execSync(command, { 
                cwd: this.projectRoot, 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            this.log(`✅ Success: ${description}`);
            return { success: true, output: result };
        } catch (error) {
            this.log(`❌ Error: ${description} - ${error.message}`, 'ERROR');
            return { success: false, error: error.message };
        }
    }

    async checkForChanges() {
        try {
            const status = execSync('git status --porcelain', { 
                cwd: this.projectRoot, 
                encoding: 'utf8' 
            });
            return status.trim().length > 0;
        } catch (error) {
            this.log(`❌ Error checking git status: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async getCommitMessage() {
        const timestamp = new Date().toLocaleString();
        const changes = execSync('git status --porcelain', { 
            cwd: this.projectRoot, 
            encoding: 'utf8' 
        });
        
        const changedFiles = changes.split('\n')
            .filter(line => line.trim())
            .map(line => line.substring(3))
            .slice(0, 5); // Limit to first 5 files for commit message
        
        return `🤖 Auto-sync #${this.syncCount} - ${timestamp}\n\nChanged files:\n${changedFiles.join('\n')}`;
    }

    async performSync() {
        if (this.isRunning) {
            this.log('⚠️ Sync already in progress, skipping...', 'WARN');
            return;
        }

        this.isRunning = true;
        this.syncCount++;
        
        this.log(`🚀 Starting auto-sync #${this.syncCount}`);
        this.log(`📁 Project root: ${this.projectRoot}`);

        // Check if there are any changes
        const hasChanges = await this.checkForChanges();
        if (!hasChanges) {
            this.log('📭 No changes detected, skipping sync');
            this.isRunning = false;
            return;
        }

        this.log('📝 Changes detected, proceeding with sync...');

        // Step 1: Install dependencies
        const installResult = await this.executeCommand('npm install', 'Installing dependencies');
        if (!installResult.success) {
            this.errorCount++;
            this.isRunning = false;
            return;
        }

        // Step 2: Clean and build
        const cleanResult = await this.executeCommand('npm run clean', 'Cleaning build directory');
        if (!cleanResult.success) {
            this.errorCount++;
            this.isRunning = false;
            return;
        }

        const buildResult = await this.executeCommand('npm run build', 'Building project');
        if (!buildResult.success) {
            this.errorCount++;
            this.isRunning = false;
            return;
        }

        // Step 3: Stage all changes
        const stageResult = await this.executeCommand('git add -A', 'Staging all changes');
        if (!stageResult.success) {
            this.errorCount++;
            this.isRunning = false;
            return;
        }

        // Step 4: Commit changes
        const commitMessage = await this.getCommitMessage();
        const commitResult = await this.executeCommand(
            `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
            'Committing changes'
        );
        if (!commitResult.success) {
            this.errorCount++;
            this.isRunning = false;
            return;
        }

        // Step 5: Push to remote (both origin and upstream for redundancy)
        const pushOriginResult = await this.executeCommand('git push origin main', 'Pushing to origin');
        const pushUpstreamResult = await this.executeCommand('git push upstream main', 'Pushing to upstream (Netlify monitored)');
        
        if (!pushOriginResult.success && !pushUpstreamResult.success) {
            this.log('⚠️ Warning: Failed to push to both remotes, but continuing...', 'WARN');
        } else {
            this.log('✅ Successfully pushed to at least one remote');
            if (pushUpstreamResult.success) {
                this.log('🎉 Successfully pushed to upstream - Netlify should auto-deploy');
            }
        }
        if (!pushResult.success) {
            this.errorCount++;
            this.isRunning = false;
            return;
        }

        this.lastSyncTime = new Date();
        this.log(`🎉 Auto-sync #${this.syncCount} completed successfully!`);
        this.log(`📊 Sync stats: ${this.syncCount} successful, ${this.errorCount} errors`);
        
        this.isRunning = false;
    }

    start() {
        this.log('🚀 Starting Auto-Sync Manager');
        this.log(`⏰ Sync interval: ${this.syncInterval / 1000} seconds`);
        this.log(`📝 Log file: ${this.logFile}`);
        
        // Perform initial sync
        this.performSync();
        
        // Set up recurring sync
        setInterval(() => {
            this.performSync();
        }, this.syncInterval);
        
        this.log('✅ Auto-sync manager is now running...');
        this.log('💡 Press Ctrl+C to stop the auto-sync manager');
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            this.log('🛑 Received SIGINT, shutting down gracefully...');
            this.log(`📊 Final stats: ${this.syncCount} syncs, ${this.errorCount} errors`);
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            this.log('🛑 Received SIGTERM, shutting down gracefully...');
            this.log(`📊 Final stats: ${this.syncCount} syncs, ${this.errorCount} errors`);
            process.exit(0);
        });
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            syncCount: this.syncCount,
            errorCount: this.errorCount,
            lastSyncTime: this.lastSyncTime,
            syncInterval: this.syncInterval
        };
    }
}

// Main execution
if (require.main === module) {
    const autoSync = new AutoSyncManager();
    autoSync.start();
}

module.exports = AutoSyncManager; 