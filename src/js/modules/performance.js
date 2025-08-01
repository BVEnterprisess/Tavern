export class PerformanceModule {
    constructor(app) {
        this.app = app;
        this.state = app.state;
        this.elements = app.elements;
    }

    initialize() {
        this.createPerformanceDashboard();
        this.startRealTimeMonitoring();
    }

    createPerformanceDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'performance-dashboard';
        dashboard.className = 'fixed top-4 right-4 bg-black bg-opacity-80 p-4 rounded-lg text-xs z-50 max-w-xs';
        dashboard.innerHTML = `
            <h3 class="font-bold text-yellow-400 mb-2">Performance Monitor</h3>
            <div id="performance-metrics" class="space-y-1">
                <div>Load Time: <span id="load-time">-</span></div>
                <div>Memory: <span id="memory-usage">-</span></div>
                <div>Errors: <span id="error-count">-</span></div>
                <div>OCR Avg: <span id="ocr-avg">-</span></div>
            </div>
            <button id="performance-toggle" class="mt-2 text-xs bg-gray-700 px-2 py-1 rounded">Hide</button>
        `;
        
        document.body.appendChild(dashboard);
        
        // Toggle visibility
        const toggle = document.getElementById('performance-toggle');
        toggle.addEventListener('click', () => {
            const metrics = document.getElementById('performance-metrics');
            const isHidden = metrics.classList.contains('hidden');
            metrics.classList.toggle('hidden');
            toggle.textContent = isHidden ? 'Hide' : 'Show';
        });
    }

    startRealTimeMonitoring() {
        setInterval(() => {
            this.updateMetrics();
        }, 2000);
    }

    updateMetrics() {
        if (!this.app.services.monitor) return;
        
        const metrics = this.app.services.monitor.getMetrics();
        
        // Update display
        const loadTimeEl = document.getElementById('load-time');
        const memoryEl = document.getElementById('memory-usage');
        const errorEl = document.getElementById('error-count');
        const ocrAvgEl = document.getElementById('ocr-avg');
        
        if (loadTimeEl) loadTimeEl.textContent = `${metrics.loadTime.toFixed(0)}ms`;
        if (memoryEl) memoryEl.textContent = `${metrics.memoryUsage.toFixed(1)}MB`;
        if (errorEl) errorEl.textContent = metrics.errors.length;
        if (ocrAvgEl) ocrAvgEl.textContent = `${metrics.averageOCRTime.toFixed(0)}ms`;
    }

    cleanup() {
        const dashboard = document.getElementById('performance-dashboard');
        if (dashboard) {
            dashboard.remove();
        }
    }
}