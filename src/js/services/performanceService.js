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
            
            // Report to analytics if available
            if (window.gtag) {
                window.gtag('event', 'page_load_time', {
                    value: Math.round(this.metrics.loadTime)
                });
            }
        });
        
        // Track memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
                
                // Alert if memory usage is high
                if (this.metrics.memoryUsage > 100) {
                    console.warn('⚠️ High memory usage:', this.metrics.memoryUsage.toFixed(2), 'MB');
                }
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

        // Track module load times
        this.trackModuleLoads();
    }

    trackModuleLoads() {
        const originalLoadModule = this.app?.loadModule;
        if (originalLoadModule) {
            this.app.loadModule = async (moduleName) => {
                const startTime = performance.now();
                const result = await originalLoadModule.call(this.app, moduleName);
                const loadTime = performance.now() - startTime;
                
                console.log(`📦 Module ${moduleName} loaded in ${loadTime.toFixed(2)}ms`);
                return result;
            };
        }
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