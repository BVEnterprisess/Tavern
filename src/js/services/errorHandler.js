/**
 * Comprehensive Error Handling Service
 * Provides centralized error handling, logging, and recovery
 */

export class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.recoveryStrategies = new Map();
        this.init();
    }

    init() {
        // Global error handlers
        window.addEventListener('error', (e) => this.handleError(e.error, 'global'));
        window.addEventListener('unhandledrejection', (e) => this.handleError(e.reason, 'promise'));
        
        // Console error interception
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.handleError(new Error(args.join(' ')), 'console');
            originalConsoleError.apply(console, args);
        };
    }

    handleError(error, source = 'unknown') {
        const errorInfo = {
            message: error.message || 'Unknown error',
            stack: error.stack,
            source: source,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Log error
        this.logError(errorInfo);

        // Attempt recovery
        this.attemptRecovery(errorInfo);

        // Show user-friendly message
        this.showUserError(errorInfo);

        // Report to monitoring service
        this.reportError(errorInfo);
    }

    logError(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }

        // Store in localStorage for debugging
        try {
            localStorage.setItem('errorLog', JSON.stringify(this.errorLog));
        } catch (e) {
            console.warn('Could not save error log:', e);
        }
    }

    attemptRecovery(errorInfo) {
        // Check for specific recovery strategies
        const strategy = this.recoveryStrategies.get(errorInfo.message);
        if (strategy) {
            try {
                strategy(errorInfo);
            } catch (e) {
                console.warn('Recovery strategy failed:', e);
            }
        }

        // Generic recovery strategies
        this.genericRecovery(errorInfo);
    }

    genericRecovery(errorInfo) {
        // Reload modules if they failed
        if (errorInfo.message.includes('module') || errorInfo.message.includes('import')) {
            this.reloadModules();
        }

        // Clear corrupted data
        if (errorInfo.message.includes('JSON') || errorInfo.message.includes('parse')) {
            this.clearCorruptedData();
        }

        // Reinitialize services
        if (errorInfo.message.includes('service') || errorInfo.message.includes('initialize')) {
            this.reinitializeServices();
        }
    }

    reloadModules() {
        console.log('Attempting to reload modules...');
        // Trigger module reload
        window.dispatchEvent(new CustomEvent('moduleReload'));
    }

    clearCorruptedData() {
        console.log('Clearing corrupted data...');
        const keysToClear = ['items86', 'inventoryData', 'ocrData'];
        keysToClear.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn(`Could not clear ${key}:`, e);
            }
        });
    }

    reinitializeServices() {
        console.log('Reinitializing services...');
        // Trigger service reinitialization
        window.dispatchEvent(new CustomEvent('serviceReinit'));
    }

    showUserError(errorInfo) {
        // Don't show technical errors to users
        if (errorInfo.message.includes('module') || errorInfo.message.includes('import')) {
            return;
        }

        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg z-50';
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>Something went wrong. Please try again.</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    reportError(errorInfo) {
        // Send to monitoring service (if configured)
        if (window.analytics && window.analytics.track) {
            window.analytics.track('Error', {
                message: errorInfo.message,
                source: errorInfo.source,
                url: errorInfo.url
            });
        }
    }

    addRecoveryStrategy(errorPattern, strategy) {
        this.recoveryStrategies.set(errorPattern, strategy);
    }

    getErrorLog() {
        return this.errorLog;
    }

    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('errorLog');
    }
}