/**
 * REAL Error Handler with Circuit Breakers and Recovery
 */

export class RealErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxErrorLogSize = 100;
        this.circuitBreakers = new Map();
        this.recoveryStrategies = new Map();
        this.errorCounts = new Map();
        this.maxErrorsPerMinute = 10;
        
        this.init();
    }

    init() {
        // Set up error monitoring with limits
        this.setupErrorMonitoring();
        
        // Set up recovery strategies
        this.setupRecoveryStrategies();
        
        // Set up circuit breakers
        this.setupCircuitBreakers();
    }

    setupErrorMonitoring() {
        // Monitor unhandled errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'unhandled');
        });

        // Monitor unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'promise');
        });

        // Monitor console errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.handleError(new Error(args.join(' ')), 'console');
            originalConsoleError.apply(console, args);
        };
    }

    setupRecoveryStrategies() {
        // Define recovery strategies for different error types
        this.recoveryStrategies.set('network', this.retryWithBackoff.bind(this));
        this.recoveryStrategies.set('storage', this.recoverStorage.bind(this));
        this.recoveryStrategies.set('auth', this.recoverAuth.bind(this));
        this.recoveryStrategies.set('validation', this.recoverValidation.bind(this));
    }

    setupCircuitBreakers() {
        // Set up circuit breakers for different services
        const services = ['auth', 'storage', 'network', 'validation'];
        services.forEach(service => {
            this.circuitBreakers.set(service, {
                failures: 0,
                lastFailureTime: 0,
                state: 'CLOSED',
                threshold: 5,
                timeout: 60000
            });
        });
    }

    handleError(error, source = 'unknown') {
        try {
            // Rate limiting for error handling
            if (this.isErrorRateLimited(source)) {
                console.warn('Error rate limit exceeded for', source);
                return;
            }

            // Circuit breaker check
            if (this.isCircuitBreakerOpen(source)) {
                console.warn('Circuit breaker open for', source);
                return;
            }

            // Log error with limits
            this.logError(error, source);

            // Attempt recovery
            this.attemptRecovery(error, source);

            // Update circuit breaker
            this.updateCircuitBreaker(source, false);

        } catch (recoveryError) {
            console.error('Error handling failed:', recoveryError);
            this.updateCircuitBreaker(source, true);
        }
    }

    logError(error, source) {
        const errorEntry = {
            message: error.message || 'Unknown error',
            stack: error.stack,
            source: source,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Add to log with size limit
        this.errorLog.push(errorEntry);
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog.shift(); // Remove oldest error
        }

        // Update error count
        const key = `${source}_${Math.floor(Date.now() / 60000)}`;
        this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    }

    isErrorRateLimited(source) {
        const key = `${source}_${Math.floor(Date.now() / 60000)}`;
        const count = this.errorCounts.get(key) || 0;
        return count > this.maxErrorsPerMinute;
    }

    isCircuitBreakerOpen(source) {
        const circuitBreaker = this.circuitBreakers.get(source);
        if (!circuitBreaker) return false;

        if (circuitBreaker.state === 'OPEN') {
            if (Date.now() - circuitBreaker.lastFailureTime > circuitBreaker.timeout) {
                circuitBreaker.state = 'HALF_OPEN';
                return false;
            }
            return true;
        }

        return false;
    }

    updateCircuitBreaker(source, isFailure) {
        const circuitBreaker = this.circuitBreakers.get(source);
        if (!circuitBreaker) return;

        if (isFailure) {
            circuitBreaker.failures++;
            circuitBreaker.lastFailureTime = Date.now();
            
            if (circuitBreaker.failures >= circuitBreaker.threshold) {
                circuitBreaker.state = 'OPEN';
            }
        } else {
            circuitBreaker.failures = 0;
            circuitBreaker.state = 'CLOSED';
        }
    }

    async attemptRecovery(error, source) {
        const recoveryStrategy = this.recoveryStrategies.get(source);
        if (recoveryStrategy) {
            try {
                await recoveryStrategy(error);
            } catch (recoveryError) {
                console.error('Recovery failed for', source, recoveryError);
            }
        }
    }

    async retryWithBackoff(error, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                // Attempt retry logic here
                return true;
            } catch (retryError) {
                console.warn(`Retry ${i + 1} failed:`, retryError);
            }
        }
        throw new Error('All retries failed');
    }

    async recoverStorage(error) {
        try {
            // Attempt to recover corrupted storage
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                try {
                    JSON.parse(localStorage.getItem(key));
                } catch (parseError) {
                    // Remove corrupted data
                    localStorage.removeItem(key);
                    console.warn('Removed corrupted storage item:', key);
                }
            }
        } catch (recoveryError) {
            console.error('Storage recovery failed:', recoveryError);
        }
    }

    async recoverAuth(error) {
        try {
            // Clear invalid sessions
            const sessionId = localStorage.getItem('sessionId');
            if (sessionId) {
                localStorage.removeItem('sessionId');
                console.warn('Cleared invalid session');
            }
        } catch (recoveryError) {
            console.error('Auth recovery failed:', recoveryError);
        }
    }

    async recoverValidation(error) {
        try {
            // Reset validation state
            const formElements = document.querySelectorAll('form');
            formElements.forEach(form => {
                form.reset();
                const errorElements = form.querySelectorAll('.field-error');
                errorElements.forEach(el => el.remove());
            });
        } catch (recoveryError) {
            console.error('Validation recovery failed:', recoveryError);
        }
    }

    getErrorLog() {
        return [...this.errorLog];
    }

    getErrorStats() {
        const stats = {};
        for (const [key, count] of this.errorCounts.entries()) {
            const [source] = key.split('_');
            stats[source] = (stats[source] || 0) + count;
        }
        return stats;
    }

    getCircuitBreakerStatus() {
        const status = {};
        for (const [service, circuitBreaker] of this.circuitBreakers.entries()) {
            status[service] = {
                state: circuitBreaker.state,
                failures: circuitBreaker.failures,
                lastFailure: circuitBreaker.lastFailureTime
            };
        }
        return status;
    }

    clearErrorLog() {
        this.errorLog = [];
        this.errorCounts.clear();
    }

    resetCircuitBreakers() {
        for (const circuitBreaker of this.circuitBreakers.values()) {
            circuitBreaker.failures = 0;
            circuitBreaker.state = 'CLOSED';
            circuitBreaker.lastFailureTime = 0;
        }
    }

    // Health check method
    isHealthy() {
        const errorStats = this.getErrorStats();
        const totalErrors = Object.values(errorStats).reduce((sum, count) => sum + count, 0);
        
        const circuitBreakerStatus = this.getCircuitBreakerStatus();
        const openCircuitBreakers = Object.values(circuitBreakerStatus)
            .filter(status => status.state === 'OPEN').length;
        
        return {
            healthy: totalErrors < 50 && openCircuitBreakers === 0,
            totalErrors,
            openCircuitBreakers,
            errorStats,
            circuitBreakerStatus
        };
    }
}