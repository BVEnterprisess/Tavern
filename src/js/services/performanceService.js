/**
 * Performance Monitoring Service
 * Tracks and optimizes application performance
 */

export class PerformanceService {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            errors: []
        };
        
        this.startTime = performance.now();
        this.init();
    }
    
    init() {
        // Track initial load time
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now() - this.startTime;
            console.log(`🚀 Page loaded in ${this.metrics.loadTime.toFixed(2)}ms`);
        });
        
        // Track memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
            }, 5000);
        }
        
        // Error tracking
        window.addEventListener('error', (e) => {
            this.metrics.errors.push({
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                timestamp: Date.now()
            });
            console.error('❌ Error tracked:', e.message);
        });
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now()
        };
    }
    
    logPerformance() {
        console.log('📊 Performance Metrics:', this.getMetrics());
    }
}