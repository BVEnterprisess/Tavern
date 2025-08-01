/**
 * Advanced Performance Monitor
 * Tracks and optimizes application performance in real-time
 */

export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            errors: [],
            moduleLoadTimes: {},
            ocrProcessingTimes: [],
            userInteractions: []
        };
        
        this.startTime = performance.now();
        this.init();
    }
    
    init() {
        // Track initial load time
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now() - this.startTime;
            console.log(`🚀 Page loaded in ${this.metrics.loadTime.toFixed(2)}ms`);
            this.reportMetric('page_load_time', this.metrics.loadTime);
        });
        
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
                
                if (this.metrics.memoryUsage > 100) {
                    console.warn('⚠️ High memory usage:', this.metrics.memoryUsage.toFixed(2), 'MB');
                    this.reportMetric('high_memory_usage', this.metrics.memoryUsage);
                }
            }, 10000);
        }
        
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('⚠️ Long task detected:', entry.duration.toFixed(2), 'ms');
                        this.reportMetric('long_task', entry.duration);
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
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
            this.reportMetric('error', { message: e.message, filename: e.filename });
        });
        
        // Track user interactions
        this.trackUserInteractions();
    }
    
    trackUserInteractions() {
        const events = ['click', 'input', 'scroll', 'keydown'];
        events.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                this.metrics.userInteractions.push({
                    type: eventType,
                    target: e.target.tagName,
                    timestamp: Date.now()
                });
            }, { passive: true });
        });
    }
    
    trackModuleLoad(moduleName, loadTime) {
        this.metrics.moduleLoadTimes[moduleName] = loadTime;
        console.log(`📦 Module ${moduleName} loaded in ${loadTime.toFixed(2)}ms`);
        this.reportMetric('module_load_time', { module: moduleName, time: loadTime });
    }
    
    trackOCRProcessing(processingTime, confidence) {
        this.metrics.ocrProcessingTimes.push({
            time: processingTime,
            confidence: confidence,
            timestamp: Date.now()
        });
        this.reportMetric('ocr_processing_time', { time: processingTime, confidence: confidence });
    }
    
    reportMetric(name, value) {
        // Send to analytics if available
        if (window.gtag) {
            window.gtag('event', name, { value: value });
        }
        
        // Store locally
        const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '{}');
        metrics[name] = value;
        localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            averageOCRTime: this.calculateAverageOCRTime(),
            averageModuleLoadTime: this.calculateAverageModuleLoadTime()
        };
    }
    
    calculateAverageOCRTime() {
        if (this.metrics.ocrProcessingTimes.length === 0) return 0;
        const total = this.metrics.ocrProcessingTimes.reduce((sum, item) => sum + item.time, 0);
        return total / this.metrics.ocrProcessingTimes.length;
    }
    
    calculateAverageModuleLoadTime() {
        const times = Object.values(this.metrics.moduleLoadTimes);
        if (times.length === 0) return 0;
        const total = times.reduce((sum, time) => sum + time, 0);
        return total / times.length;
    }
    
    generateReport() {
        const metrics = this.getMetrics();
        return {
            summary: {
                totalErrors: metrics.errors.length,
                averageOCRTime: metrics.averageOCRTime.toFixed(2) + 'ms',
                averageModuleLoadTime: metrics.averageModuleLoadTime.toFixed(2) + 'ms',
                memoryUsage: metrics.memoryUsage.toFixed(2) + 'MB',
                userInteractions: metrics.userInteractions.length
            },
            details: metrics
        };
    }
    
    logPerformance() {
        console.log('📊 Performance Report:', this.generateReport());
    }
}