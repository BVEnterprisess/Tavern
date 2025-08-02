/**
 * Secure Authentication Service
 * Implements proper security practices with encryption and session management
 */

import { ErrorHandler } from './errorHandler.js';

export class SecureAuthService {
    constructor() {
        this.errorHandler = new ErrorHandler();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.loginAttempts = new Map();
        this.sessions = new Map();
        this.init();
    }

    init() {
        // Check for existing session
        this.checkSession();
        
        // Set up session cleanup
        setInterval(() => this.cleanupSessions(), 60000); // Every minute
        
        // Set up login attempt cleanup
        setInterval(() => this.cleanupLoginAttempts(), 300000); // Every 5 minutes
    }

    async authenticate(username, password) {
        try {
            // Check for lockout
            if (this.isLockedOut(username)) {
                throw new Error('Account temporarily locked. Please try again later.');
            }

            // Validate input
            if (!this.validateInput(username, password)) {
                this.recordFailedAttempt(username);
                throw new Error('Invalid credentials.');
            }

            // Hash password for comparison
            const hashedPassword = await this.hashPassword(password);
            
            // Check credentials (in production, this would be against a database)
            const isValid = await this.verifyCredentials(username, hashedPassword);
            
            if (isValid) {
                // Create session
                const session = this.createSession(username);
                
                // Clear failed attempts
                this.loginAttempts.delete(username);
                
                // Log successful login
                this.logActivity(username, 'login_success');
                
                return {
                    success: true,
                    session: session,
                    user: this.getUserInfo(username)
                };
            } else {
                this.recordFailedAttempt(username);
                throw new Error('Invalid credentials.');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'auth');
            throw error;
        }
    }

    validateInput(username, password) {
        // Basic input validation
        if (!username || !password) {
            return false;
        }

        // Sanitize inputs
        const sanitizedUsername = this.sanitizeInput(username);
        const sanitizedPassword = this.sanitizeInput(password);

        // Check for suspicious patterns
        if (this.containsSuspiciousPatterns(sanitizedUsername) || 
            this.containsSuspiciousPatterns(sanitizedPassword)) {
            return false;
        }

        return true;
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }

        // Remove potentially dangerous characters
        return input
            .replace(/[<>]/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove JavaScript protocol
            .trim();
    }

    containsSuspiciousPatterns(input) {
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /eval\s*\(/i,
            /document\./i,
            /window\./i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(input));
    }

    async hashPassword(password) {
        // In production, use a proper hashing library like bcrypt
        // For now, use a simple hash (NOT for production)
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'table1837_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async verifyCredentials(username, hashedPassword) {
        // In production, this would query a database
        // For demo purposes, use a predefined hash
        const validCredentials = {
            'user@table1837.com': '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // password123
            'admin@table1837.com': '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'  // admin123
        };

        return validCredentials[username] === hashedPassword;
    }

    createSession(username) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            username: username,
            created: Date.now(),
            lastActivity: Date.now(),
            permissions: this.getUserPermissions(username)
        };

        this.sessions.set(sessionId, session);
        
        // Store session ID securely
        this.setSecureCookie('sessionId', sessionId, this.sessionTimeout);
        
        return session;
    }

    generateSessionId() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    setSecureCookie(name, value, maxAge) {
        const cookie = `${name}=${value}; max-age=${maxAge / 1000}; path=/; secure; samesite=strict`;
        document.cookie = cookie;
    }

    getSecureCookie(name) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null;
    }

    checkSession() {
        const sessionId = this.getSecureCookie('sessionId');
        if (sessionId && this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId);
            
            // Check if session is expired
            if (Date.now() - session.lastActivity > this.sessionTimeout) {
                this.logout();
                return false;
            }
            
            // Update last activity
            session.lastActivity = Date.now();
            this.sessions.set(sessionId, session);
            
            return true;
        }
        return false;
    }

    logout() {
        const sessionId = this.getSecureCookie('sessionId');
        if (sessionId) {
            this.sessions.delete(sessionId);
            document.cookie = 'sessionId=; max-age=0; path=/';
        }
    }

    isAuthenticated() {
        return this.checkSession();
    }

    getCurrentUser() {
        const sessionId = this.getSecureCookie('sessionId');
        if (sessionId && this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId);
        }
        return null;
    }

    getUserPermissions(username) {
        // Define user roles and permissions
        const permissions = {
            'user@table1837.com': ['read', 'write'],
            'admin@table1837.com': ['read', 'write', 'admin', 'ocr']
        };
        
        return permissions[username] || ['read'];
    }

    getUserInfo(username) {
        const userInfo = {
            'user@table1837.com': {
                name: 'Staff User',
                role: 'Staff',
                email: username
            },
            'admin@table1837.com': {
                name: 'Administrator',
                role: 'Admin',
                email: username
            }
        };
        
        return userInfo[username] || { name: 'Unknown User', role: 'Guest', email: username };
    }

    recordFailedAttempt(username) {
        const attempts = this.loginAttempts.get(username) || 0;
        this.loginAttempts.set(username, attempts + 1);
        
        // Log failed attempt
        this.logActivity(username, 'login_failed');
        
        // Lock account if too many attempts
        if (attempts + 1 >= this.maxLoginAttempts) {
            this.logActivity(username, 'account_locked');
        }
    }

    isLockedOut(username) {
        const attempts = this.loginAttempts.get(username) || 0;
        return attempts >= this.maxLoginAttempts;
    }

    cleanupSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActivity > this.sessionTimeout) {
                this.sessions.delete(sessionId);
            }
        }
    }

    cleanupLoginAttempts() {
        const now = Date.now();
        for (const [username, attempts] of this.loginAttempts.entries()) {
            // Reset attempts after lockout duration
            if (attempts >= this.maxLoginAttempts) {
                const lastAttempt = this.loginAttempts.get(username + '_time') || 0;
                if (now - lastAttempt > this.lockoutDuration) {
                    this.loginAttempts.delete(username);
                    this.loginAttempts.delete(username + '_time');
                }
            }
        }
    }

    logActivity(username, action) {
        const activity = {
            username: username,
            action: action,
            timestamp: new Date().toISOString(),
            ip: 'client-side', // In production, this would be server-side
            userAgent: navigator.userAgent
        };

        // Store activity log
        try {
            const activityLog = JSON.parse(localStorage.getItem('activityLog') || '[]');
            activityLog.push(activity);
            
            // Keep only last 100 activities
            if (activityLog.length > 100) {
                activityLog.splice(0, activityLog.length - 100);
            }
            
            localStorage.setItem('activityLog', JSON.stringify(activityLog));
        } catch (e) {
            console.warn('Could not log activity:', e);
        }
    }

    getActivityLog() {
        try {
            return JSON.parse(localStorage.getItem('activityLog') || '[]');
        } catch (e) {
            return [];
        }
    }
}