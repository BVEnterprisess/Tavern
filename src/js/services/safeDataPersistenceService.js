/**
 * SAFE Data Persistence Service
 * Implements proper storage limits, cleanup, and error recovery
 */

export class SafeDataPersistenceService {
    constructor() {
        this.storagePrefix = 'table1837_';
        this.maxStorageSize = 4 * 1024 * 1024; // 4MB limit
        this.maxItemSize = 1024 * 1024; // 1MB per item
        this.cleanupThreshold = 0.8; // 80% usage triggers cleanup
        this.maxBackups = 5; // Reduced from 10
        this.backupInterval = 10 * 60 * 1000; // 10 minutes (increased from 5)
        
        this.storageManager = {
            intervals: new Set(),
            eventListeners: new Set(),
            observers: new Set()
        };
        
        this.circuitBreaker = {
            failures: 0,
            lastFailureTime: 0,
            state: 'CLOSED',
            threshold: 3,
            timeout: 30000
        };
        
        this.init();
    }

    init() {
        // Start backup schedule with proper management
        const backupInterval = setInterval(() => this.createBackup(), this.backupInterval);
        this.storageManager.intervals.add(backupInterval);
        
        // Check data integrity on startup
        this.checkDataIntegrity();
    }

    destroy() {
        // Proper cleanup of all resources
        this.storageManager.intervals.forEach(interval => clearInterval(interval));
        this.storageManager.intervals.clear();
        
        this.storageManager.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.storageManager.eventListeners.clear();
        
        this.storageManager.observers.forEach(observer => observer.disconnect());
        this.storageManager.observers.clear();
    }

    saveData(key, data) {
        try {
            // Circuit breaker check
            if (this.circuitBreaker.state === 'OPEN') {
                if (Date.now() - this.circuitBreaker.lastFailureTime > this.circuitBreaker.timeout) {
                    this.circuitBreaker.state = 'HALF_OPEN';
                } else {
                    throw new Error('Storage service temporarily unavailable.');
                }
            }

            // Check storage size before saving
            const currentSize = this.getStorageSize();
            if (currentSize > this.maxStorageSize * this.cleanupThreshold) {
                this.emergencyCleanup();
            }

            const fullKey = this.storagePrefix + key;
            const dataWithMeta = {
                data: data,
                timestamp: Date.now(),
                version: '1.0',
                checksum: this.calculateChecksum(data)
            };
            
            const serialized = JSON.stringify(dataWithMeta);
            
            // Check item size limit
            if (serialized.length > this.maxItemSize) {
                throw new Error('Data too large to store');
            }
            
            // Check total storage limit
            if (this.getStorageSize() + serialized.length > this.maxStorageSize) {
                this.emergencyCleanup();
            }
            
            localStorage.setItem(fullKey, serialized);
            
            this.recordSuccess();
            return true;
        } catch (error) {
            this.recordFailure();
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
            
            this.recordSuccess();
            return parsed.data;
        } catch (error) {
            this.recordFailure();
            console.error('Failed to load data:', error);
            return this.recoverData(key, defaultValue);
        }
    }

    getStorageSize() {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                const value = localStorage.getItem(key);
                totalSize += key.length + value.length;
            }
        }
        return totalSize;
    }

    emergencyCleanup() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    try {
                        const value = JSON.parse(localStorage.getItem(key));
                        keys.push({ key, timestamp: value.timestamp || 0 });
                    } catch (e) {
                        // Remove corrupted data
                        localStorage.removeItem(key);
                    }
                }
            }
            
            // Sort by timestamp (oldest first)
            keys.sort((a, b) => a.timestamp - b.timestamp);
            
            // Remove oldest 50% of data
            const keysToRemove = keys.slice(0, Math.floor(keys.length / 2));
            keysToRemove.forEach(({ key }) => localStorage.removeItem(key));
            
            console.log('Emergency cleanup completed. Removed', keysToRemove.length, 'items');
        } catch (error) {
            console.error('Emergency cleanup failed:', error);
            // Last resort: clear all data
            this.clearAllData();
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
            // Check if we have space for backup
            if (this.getStorageSize() > this.maxStorageSize * 0.9) {
                console.warn('Storage nearly full, skipping backup');
                return;
            }

            const backup = {
                timestamp: Date.now(),
                data: {}
            };
            
            // Backup all data with prefix (limited)
            let backupCount = 0;
            for (let i = 0; i < localStorage.length && backupCount < 100; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    try {
                        backup.data[key] = localStorage.getItem(key);
                        backupCount++;
                    } catch (e) {
                        // Skip corrupted data
                        continue;
                    }
                }
            }
            
            // Store backup with size limit
            const backupKey = `backup_${Date.now()}`;
            const backupString = JSON.stringify(backup);
            
            if (backupString.length > this.maxItemSize) {
                console.warn('Backup too large, skipping');
                return;
            }
            
            localStorage.setItem(backupKey, backupString);
            
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
        const keys = ['items86', 'inventoryData', 'ocrData'];
        
        for (const key of keys) {
            try {
                const data = this.loadData(key);
                if (data === null) {
                    console.warn(`Missing data for ${key}, attempting recovery...`);
                    this.recoverData(key, this.getDefaultValue(key));
                }
            } catch (error) {
                console.error(`Data integrity check failed for ${key}:`, error);
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
            }
        };
        
        return defaults[key] || null;
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

    recordSuccess() {
        this.circuitBreaker.failures = 0;
        this.circuitBreaker.state = 'CLOSED';
    }

    recordFailure() {
        this.circuitBreaker.failures++;
        this.circuitBreaker.lastFailureTime = Date.now();
        
        if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
            this.circuitBreaker.state = 'OPEN';
        }
    }
}