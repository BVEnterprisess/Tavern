/**
 * Advanced Data Persistence Service
 * Handles data storage, backup, sync, and recovery
 */

export class DataPersistenceService {
    constructor() {
        this.storagePrefix = 'table1837_';
        this.backupInterval = 5 * 60 * 1000; // 5 minutes
        this.maxBackups = 10;
        this.syncInterval = 30 * 1000; // 30 seconds
        this.init();
    }

    init() {
        // Start backup schedule
        setInterval(() => this.createBackup(), this.backupInterval);
        
        // Start sync schedule
        setInterval(() => this.syncData(), this.syncInterval);
        
        // Restore from backup if needed
        this.checkDataIntegrity();
    }

    saveData(key, data) {
        try {
            const fullKey = this.storagePrefix + key;
            const dataWithMeta = {
                data: data,
                timestamp: Date.now(),
                version: '1.0',
                checksum: this.calculateChecksum(data)
            };
            
            localStorage.setItem(fullKey, JSON.stringify(dataWithMeta));
            
            // Create immediate backup
            this.createBackup();
            
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    loadData(key, defaultValue = null) {
        try {
            const fullKey = this.storagePrefix + key;
            const stored = localStorage.getItem(fullKey);
            
            if (!stored) {
                return defaultValue;
            }
            
            const parsed = JSON.parse(stored);
            
            // Verify data integrity
            if (!this.verifyDataIntegrity(parsed)) {
                console.warn('Data integrity check failed, attempting recovery...');
                return this.recoverData(key, defaultValue);
            }
            
            return parsed.data;
        } catch (error) {
            console.error('Failed to load data:', error);
            return this.recoverData(key, defaultValue);
        }
    }

    calculateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    verifyDataIntegrity(dataWithMeta) {
        if (!dataWithMeta || !dataWithMeta.data || !dataWithMeta.checksum) {
            return false;
        }
        
        const calculatedChecksum = this.calculateChecksum(dataWithMeta.data);
        return calculatedChecksum === dataWithMeta.checksum;
    }

    createBackup() {
        try {
            const backup = {
                timestamp: Date.now(),
                data: {}
            };
            
            // Backup all data with prefix
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    backup.data[key] = localStorage.getItem(key);
                }
            }
            
            // Store backup
            const backupKey = `backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(backup));
            
            // Clean old backups
            this.cleanOldBackups();
            
            console.log('Backup created successfully');
        } catch (error) {
            console.error('Failed to create backup:', error);
        }
    }

    cleanOldBackups() {
        const backups = [];
        
        // Find all backups
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('backup_')) {
                try {
                    const backup = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        key: key,
                        timestamp: backup.timestamp
                    });
                } catch (e) {
                    // Remove corrupted backup
                    localStorage.removeItem(key);
                }
            }
        }
        
        // Sort by timestamp and remove old ones
        backups.sort((a, b) => b.timestamp - a.timestamp);
        
        for (let i = this.maxBackups; i < backups.length; i++) {
            localStorage.removeItem(backups[i].key);
        }
    }

    recoverData(key, defaultValue) {
        try {
            // Try to find backup
            const backups = this.getBackups();
            
            for (const backup of backups) {
                if (backup.data[this.storagePrefix + key]) {
                    const recovered = JSON.parse(backup.data[this.storagePrefix + key]);
                    if (this.verifyDataIntegrity(recovered)) {
                        console.log('Data recovered from backup');
                        return recovered.data;
                    }
                }
            }
            
            console.warn('No valid backup found, using default value');
            return defaultValue;
        } catch (error) {
            console.error('Recovery failed:', error);
            return defaultValue;
        }
    }

    getBackups() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('backup_')) {
                try {
                    const backup = JSON.parse(localStorage.getItem(key));
                    backups.push(backup);
                } catch (e) {
                    // Skip corrupted backup
                }
            }
        }
        
        return backups.sort((a, b) => b.timestamp - a.timestamp);
    }

    checkDataIntegrity() {
        const keys = ['items86', 'inventoryData', 'ocrData', 'userPreferences'];
        
        for (const key of keys) {
            const data = this.loadData(key);
            if (data === null) {
                console.warn(`Missing data for ${key}, attempting recovery...`);
                this.recoverData(key, this.getDefaultValue(key));
            }
        }
    }

    getDefaultValue(key) {
        const defaults = {
            items86: [],
            inventoryData: {},
            ocrData: {
                redWine: null,
                whiteWine: null,
                starters: [],
                entrees: [],
                cocktail: null
            },
            userPreferences: {
                theme: 'dark',
                notifications: true,
                autoSave: true
            }
        };
        
        return defaults[key] || null;
    }

    syncData() {
        // In a real application, this would sync with a server
        // For now, we'll just ensure local data is consistent
        
        const syncData = {
            timestamp: Date.now(),
            data: {}
        };
        
        // Collect all data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                syncData.data[key] = localStorage.getItem(key);
            }
        }
        
        // Store sync state
        localStorage.setItem('lastSync', JSON.stringify(syncData));
    }

    exportData() {
        const exportData = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                exportData[key] = localStorage.getItem(key);
            }
        }
        
        return exportData;
    }

    importData(data) {
        try {
            for (const [key, value] of Object.entries(data)) {
                if (key.startsWith(this.storagePrefix)) {
                    localStorage.setItem(key, value);
                }
            }
            
            console.log('Data imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    clearAllData() {
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                keysToRemove.push(key);
            }
        }
        
        for (const key of keysToRemove) {
            localStorage.removeItem(key);
        }
        
        console.log('All data cleared');
    }
}