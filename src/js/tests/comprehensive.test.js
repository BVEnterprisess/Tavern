/**
 * Comprehensive Test Suite for Table 1837 Bar Management System
 * Covers all modules, services, and edge cases
 */

import { SecureAuthService } from '../services/secureAuthService.js';
import { DataPersistenceService } from '../services/dataPersistenceService.js';
import { ErrorHandler } from '../services/errorHandler.js';
import { PerformanceMonitor } from '../services/performanceMonitor.js';

// Mock DOM environment for testing
const mockDOM = () => {
    global.document = {
        getElementById: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
        addEventListener: jest.fn(),
        createElement: jest.fn(() => ({
            addEventListener: jest.fn(),
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn()
            }
        })),
        body: {
            appendChild: jest.fn(),
            removeChild: jest.fn()
        }
    };
    
    global.window = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        location: { href: 'http://localhost:3000' },
        performance: {
            now: jest.fn(() => Date.now()),
            memory: {
                usedJSHeapSize: 1000000,
                totalJSHeapSize: 2000000
            }
        },
        crypto: {
            getRandomValues: jest.fn(() => new Uint8Array(32)),
            subtle: {
                digest: jest.fn()
            }
        },
        localStorage: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
            length: 0,
            key: jest.fn()
        }
    };
    
    global.navigator = {
        userAgent: 'Mozilla/5.0 (Test Browser)'
    };
};

// Test suite for Authentication Service
describe('SecureAuthService', () => {
    let authService;
    
    beforeEach(() => {
        mockDOM();
        authService = new SecureAuthService();
    });
    
    test('should validate input correctly', () => {
        expect(authService.validateInput('user@test.com', 'password123')).toBe(true);
        expect(authService.validateInput('', 'password')).toBe(false);
        expect(authService.validateInput('user@test.com', '')).toBe(false);
    });
    
    test('should sanitize input correctly', () => {
        expect(authService.sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
        expect(authService.sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
        expect(authService.sanitizeInput('normal input')).toBe('normal input');
    });
    
    test('should detect suspicious patterns', () => {
        expect(authService.containsSuspiciousPatterns('<script>')).toBe(true);
        expect(authService.containsSuspiciousPatterns('javascript:')).toBe(true);
        expect(authService.containsSuspiciousPatterns('normal text')).toBe(false);
    });
    
    test('should create session correctly', () => {
        const session = authService.createSession('user@test.com');
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('username');
        expect(session).toHaveProperty('created');
        expect(session.username).toBe('user@test.com');
    });
    
    test('should handle login attempts correctly', () => {
        authService.recordFailedAttempt('user@test.com');
        authService.recordFailedAttempt('user@test.com');
        expect(authService.isLockedOut('user@test.com')).toBe(false);
        
        // Add more attempts to trigger lockout
        for (let i = 0; i < 3; i++) {
            authService.recordFailedAttempt('user@test.com');
        }
        expect(authService.isLockedOut('user@test.com')).toBe(true);
    });
});

// Test suite for Data Persistence Service
describe('DataPersistenceService', () => {
    let dataService;
    
    beforeEach(() => {
        mockDOM();
        dataService = new DataPersistenceService();
    });
    
    test('should save and load data correctly', () => {
        const testData = { test: 'value', number: 123 };
        const success = dataService.saveData('testKey', testData);
        expect(success).toBe(true);
        
        const loadedData = dataService.loadData('testKey');
        expect(loadedData).toEqual(testData);
    });
    
    test('should handle data corruption gracefully', () => {
        // Simulate corrupted data
        window.localStorage.setItem('table1837_testKey', 'invalid json');
        
        const loadedData = dataService.loadData('testKey', 'default');
        expect(loadedData).toBe('default');
    });
    
    test('should calculate checksum correctly', () => {
        const data = { test: 'value' };
        const checksum1 = dataService.calculateChecksum(data);
        const checksum2 = dataService.calculateChecksum(data);
        expect(checksum1).toBe(checksum2);
        
        const differentData = { test: 'different' };
        const checksum3 = dataService.calculateChecksum(differentData);
        expect(checksum1).not.toBe(checksum3);
    });
    
    test('should verify data integrity', () => {
        const data = { test: 'value' };
        const dataWithMeta = {
            data: data,
            timestamp: Date.now(),
            version: '1.0',
            checksum: dataService.calculateChecksum(data)
        };
        
        expect(dataService.verifyDataIntegrity(dataWithMeta)).toBe(true);
        
        // Corrupt the data
        dataWithMeta.data = { test: 'corrupted' };
        expect(dataService.verifyDataIntegrity(dataWithMeta)).toBe(false);
    });
});

// Test suite for Error Handler
describe('ErrorHandler', () => {
    let errorHandler;
    
    beforeEach(() => {
        mockDOM();
        errorHandler = new ErrorHandler();
    });
    
    test('should log errors correctly', () => {
        const error = new Error('Test error');
        errorHandler.handleError(error, 'test');
        
        const errorLog = errorHandler.getErrorLog();
        expect(errorLog.length).toBeGreaterThan(0);
        expect(errorLog[0].message).toBe('Test error');
    });
    
    test('should handle different error sources', () => {
        const error = new Error('Test error');
        
        errorHandler.handleError(error, 'global');
        errorHandler.handleError(error, 'promise');
        errorHandler.handleError(error, 'console');
        
        const errorLog = errorHandler.getErrorLog();
        expect(errorLog.length).toBe(3);
    });
    
    test('should clear error log', () => {
        const error = new Error('Test error');
        errorHandler.handleError(error, 'test');
        
        expect(errorHandler.getErrorLog().length).toBeGreaterThan(0);
        
        errorHandler.clearErrorLog();
        expect(errorHandler.getErrorLog().length).toBe(0);
    });
});

// Test suite for Performance Monitor
describe('PerformanceMonitor', () => {
    let performanceMonitor;
    
    beforeEach(() => {
        mockDOM();
        performanceMonitor = new PerformanceMonitor();
    });
    
    test('should track metrics correctly', () => {
        expect(performanceMonitor.metrics).toHaveProperty('loadTime');
        expect(performanceMonitor.metrics).toHaveProperty('memoryUsage');
        expect(performanceMonitor.metrics).toHaveProperty('errors');
    });
    
    test('should handle performance events', () => {
        const mockEvent = { type: 'test', duration: 100 };
        performanceMonitor.handlePerformanceEvent(mockEvent);
        
        expect(performanceMonitor.metrics.userInteractions.length).toBeGreaterThan(0);
    });
});

// Integration tests
describe('Integration Tests', () => {
    beforeEach(() => {
        mockDOM();
    });
    
    test('should handle complete authentication flow', async () => {
        const authService = new SecureAuthService();
        const dataService = new DataPersistenceService();
        const errorHandler = new ErrorHandler();
        
        // Test successful authentication
        const result = await authService.authenticate('user@table1837.com', 'password123');
        expect(result.success).toBe(true);
        
        // Test data persistence
        const testData = { user: 'test', data: 'value' };
        dataService.saveData('userData', testData);
        
        const loadedData = dataService.loadData('userData');
        expect(loadedData).toEqual(testData);
    });
    
    test('should handle error recovery', () => {
        const errorHandler = new ErrorHandler();
        const dataService = new DataPersistenceService();
        
        // Simulate error
        const error = new Error('Test error');
        errorHandler.handleError(error, 'test');
        
        // Test data recovery
        const recoveredData = dataService.recoverData('nonexistent', 'default');
        expect(recoveredData).toBe('default');
    });
});

// Performance tests
describe('Performance Tests', () => {
    beforeEach(() => {
        mockDOM();
    });
    
    test('should handle large data sets efficiently', () => {
        const dataService = new DataPersistenceService();
        const largeData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            data: `Data for item ${i}`
        }));
        
        const startTime = performance.now();
        dataService.saveData('largeDataSet', largeData);
        const saveTime = performance.now() - startTime;
        
        expect(saveTime).toBeLessThan(100); // Should complete in under 100ms
        
        const loadStartTime = performance.now();
        const loadedData = dataService.loadData('largeDataSet');
        const loadTime = performance.now() - loadStartTime;
        
        expect(loadTime).toBeLessThan(100); // Should load in under 100ms
        expect(loadedData).toEqual(largeData);
    });
    
    test('should handle concurrent operations', async () => {
        const dataService = new DataPersistenceService();
        const promises = [];
        
        // Simulate concurrent saves
        for (let i = 0; i < 10; i++) {
            promises.push(
                new Promise(resolve => {
                    setTimeout(() => {
                        dataService.saveData(`concurrent_${i}`, { data: i });
                        resolve();
                    }, Math.random() * 10);
                })
            );
        }
        
        await Promise.all(promises);
        
        // Verify all data was saved
        for (let i = 0; i < 10; i++) {
            const data = dataService.loadData(`concurrent_${i}`);
            expect(data).toEqual({ data: i });
        }
    });
});

// Security tests
describe('Security Tests', () => {
    beforeEach(() => {
        mockDOM();
    });
    
    test('should prevent XSS attacks', () => {
        const authService = new SecureAuthService();
        
        const maliciousInput = '<script>alert("xss")</script>';
        const sanitized = authService.sanitizeInput(maliciousInput);
        
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('</script>');
    });
    
    test('should prevent injection attacks', () => {
        const authService = new SecureAuthService();
        
        const injectionAttempts = [
            'javascript:alert("xss")',
            'onclick="alert(\'xss\')"',
            'eval("alert(\'xss\')")',
            'document.cookie'
        ];
        
        injectionAttempts.forEach(attempt => {
            expect(authService.containsSuspiciousPatterns(attempt)).toBe(true);
        });
    });
    
    test('should handle session security', () => {
        const authService = new SecureAuthService();
        
        // Create session
        const session = authService.createSession('user@test.com');
        expect(session.id).toHaveLength(64); // 32 bytes = 64 hex chars
        
        // Verify session
        expect(authService.isAuthenticated()).toBe(true);
        
        // Test session timeout
        session.lastActivity = Date.now() - (31 * 60 * 1000); // 31 minutes ago
        expect(authService.checkSession()).toBe(false);
    });
});

// Export for use in other test files
export {
    mockDOM,
    SecureAuthService,
    DataPersistenceService,
    ErrorHandler,
    PerformanceMonitor
};