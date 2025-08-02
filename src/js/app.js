
import { AuthService } from './services/authService.js';
import { PerformanceService } from './services/performanceService.js';
import { PerformanceMonitor } from './services/performanceMonitor.js';
import { SearchService } from './services/searchService.js';
import { ThemeService } from './services/themeService.js';
import { DashboardModule } from './modules/dashboard.js';
import { StaffModule } from './modules/staff.js';
import { AdminModule } from './modules/admin.js';
import { WineModule } from './modules/wine.js';
import { InventoryModule } from './modules/inventory.js';
import { PerformanceModule } from './modules/performance.js';

export class Table1837App {
    constructor() {
        this.state = {
            items86: JSON.parse(localStorage.getItem('items86') || '[]'),
            inventoryData: JSON.parse(localStorage.getItem('inventoryData') || '{}'),
            ocrData: {
                redWine: null,
                whiteWine: null,
                starters: [],
                entrees: [],
                cocktail: null
            },
            recognition: null,
            isListening: false
        };
        
        this.elements = {};
        this.modules = {};
        this.services = {};
        
        // Initialize enhanced services
        this.initializeServices();
        
        // Expose functions globally for onclick handlers
        window.logout = () => this.logout();
    }

    init() {
        this.cacheElements();
        this.initializeModules();
        this.setupEventListeners();
        this.setupNavigation();
        this.setupEnhancedFeatures();
        this.registerServiceWorker();
        this.startPerformanceMonitoring();
    }

    startPerformanceMonitoring() {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        console.warn('⚠️ Long task detected:', entry.duration.toFixed(2), 'ms');
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
        }

        // Monitor memory usage
        setInterval(() => {
            if ('memory' in performance) {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                const totalMB = memory.totalJSHeapSize / 1024 / 1024;
                
                if (usedMB > 100) {
                    console.warn('⚠️ High memory usage:', usedMB.toFixed(2), 'MB /', totalMB.toFixed(2), 'MB');
                }
            }
        }, 10000);
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration);
                })
                .catch(error => {
                    console.error('❌ Service Worker registration failed:', error);
                });
        }
    }

    cacheElements() {
        const ids = ['alert86List', 'current86Items', 'todaySpecial', 'inventoryGrid', 
                    'voiceStatus', 'voiceText', 'ocrPreview', 'ocrResult'];
        
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    initializeModules() {
        console.log('🚀 Initializing Table 1837 modules...');
        // Initialize only dashboard initially, others will be lazy loaded
        this.modules.dashboard = new DashboardModule(this);
        this.modules.dashboard.initialize();
        
        // Initialize performance module
        this.modules.performance = new PerformanceModule(this);
        this.modules.performance.initialize();
        
        // Lazy load other modules when needed
        this.modules.staff = null;
        this.modules.admin = null;
        this.modules.wine = null;
        this.modules.inventory = null;
        
        console.log('✅ Core modules initialized successfully');
    }

    async loadModule(moduleName) {
        if (this.modules[moduleName] && this.modules[moduleName] !== null) {
            return this.modules[moduleName];
        }

        const startTime = performance.now();
        console.log(`🔄 Loading module: ${moduleName}`);
        
        let module;
        switch (moduleName) {
            case 'staff':
                if (!this.modules.staff) {
                    this.modules.staff = new StaffModule(this);
                    this.modules.staff.initialize();
                }
                module = this.modules.staff;
                break;
            case 'admin':
                if (!this.modules.admin) {
                    this.modules.admin = new AdminModule(this);
                    this.modules.admin.initialize();
                }
                module = this.modules.admin;
                break;
            case 'wine':
                if (!this.modules.wine) {
                    this.modules.wine = new WineModule(this);
                    this.modules.wine.initialize();
                }
                module = this.modules.wine;
                break;
            case 'inventory':
                if (!this.modules.inventory) {
                    this.modules.inventory = new InventoryModule(this);
                    this.modules.inventory.initialize();
                }
                module = this.modules.inventory;
                break;
            default:
                module = this.modules[moduleName];
        }
        
        const loadTime = performance.now() - startTime;
        if (this.services.monitor) {
            this.services.monitor.trackModuleLoad(moduleName, loadTime);
        }
        
        return module;
    }

    setupEventListeners() {
        // Login functionality
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    setupNavigation() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (tab.dataset.tab) {
                    this.showTab(tab.dataset.tab);
                    
                    // Update active tab
                    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                }
            });
        });
    }
    
    initializeServices() {
        // Initialize enhanced services
        this.services.performance = new PerformanceService();
        this.services.monitor = new PerformanceMonitor();
        this.services.search = new SearchService();
        this.services.theme = new ThemeService();
        
        console.log('🚀 Enhanced services initialized');
    }
    
    setupEnhancedFeatures() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 't':
                        e.preventDefault();
                        this.services.theme.toggleTheme();
                        break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                        e.preventDefault();
                        const tabs = ['dashboard', 'staff', 'admin', 'wine', 'inventory'];
                        const tabIndex = parseInt(e.key) - 1;
                        if (tabIndex < tabs.length) {
                            this.showTab(tabs[tabIndex]);
                        }
                        break;
                }
            }
        });
        
        // Add search functionality to wine tab
        const wineSearch = document.getElementById('wineSearch');
        if (wineSearch) {
            wineSearch.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 1) {
                    const results = this.services.search.search(query);
                    this.updateWineResults(results);
                }
            });
        }
    }
    
    focusSearch() {
        const searchInputs = document.querySelectorAll('input[type="text"]');
        if (searchInputs.length > 0) {
            searchInputs[0].focus();
        }
    }
    
    updateWineResults(results) {
        // Update wine display with search results
        const wineCategories = document.getElementById('wineCategories');
        if (wineCategories && results.length > 0) {
            // Implementation for updating wine results
            console.log('Search results:', results);
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value.toLowerCase();
        const password = document.getElementById('password').value;
        
        if (AuthService.authenticate(username, password)) {
            this.showMainApp();
        } else {
            alert('Invalid credentials. Please try again.');
        }
    }

    showMainApp() {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        this.init();
    }

    async showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Load module if needed
        if (tabName !== 'dashboard') {
            await this.loadModule(tabName);
        }
        
        // Show selected tab content
        const targetTab = document.getElementById(tabName + '-content');
        if (targetTab) {
            targetTab.classList.remove('hidden');
        }
    }

    logout() {
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        // Cleanup modules
        Object.values(this.modules).forEach(module => {
            if (module && module.cleanup) {
                module.cleanup();
            }
        });

        // Clear caches
        this.clearCaches();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    clearCaches() {
        // Clear OCR cache
        if (this.modules.admin && this.modules.admin.ocrService) {
            this.modules.admin.ocrService.cache.clear();
        }
        
        // Clear search cache
        if (this.services.search) {
            this.services.search.lastQuery = '';
            this.services.search.lastResults = null;
        }
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveState();
    }

    saveState() {
        localStorage.setItem('items86', JSON.stringify(this.state.items86));
        localStorage.setItem('inventoryData', JSON.stringify(this.state.inventoryData));
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-600' : 
                       type === 'error' ? 'bg-red-600' : 
                       type === 'warning' ? 'bg-yellow-600' : 'bg-dark-green';
        toast.className = `fixed bottom-4 right-4 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-up`;
        toast.textContent = message;
        
        // Append to body
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 500);
        }, 3000);
    }

    handleError(error, context = '') {
        console.error(`❌ Error in ${context}:`, error);
        
        // Log to performance service if available
        if (this.services.performance) {
            this.services.performance.metrics.errors.push({
                message: error.message,
                context: context,
                timestamp: Date.now()
            });
        }
        
        // Show user-friendly error message
        this.showToast(`An error occurred: ${error.message}`, 'error');
    }
    
    setupEnhancedFeatures() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 't':
                        e.preventDefault();
                        this.services.theme.toggleTheme();
                        break;
                }
            }
        });
        
        // Add search functionality to wine tab
        const wineSearch = document.getElementById('wineSearch');
        if (wineSearch) {
            wineSearch.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 1) {
                    const results = this.services.search.search(query);
                    this.updateWineResults(results);
                }
            });
        }
    }
    
    focusSearch() {
        const searchInputs = document.querySelectorAll('input[type="text"]');
        if (searchInputs.length > 0) {
            searchInputs[0].focus();
        }
    }
    
    updateWineResults(results) {
        // Update wine display with search results
        const wineCategories = document.getElementById('wineCategories');
        if (wineCategories && results.length > 0) {
            console.log('Search results:', results);
        }
    }
    
    setupEnhancedFeatures() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 't':
                        e.preventDefault();
                        this.services.theme.toggleTheme();
                        break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                        e.preventDefault();
                        const tabs = ['dashboard', 'staff', 'admin', 'wine', 'inventory'];
                        const tabIndex = parseInt(e.key) - 1;
                        if (tabIndex < tabs.length) {
                            this.showTab(tabs[tabIndex]);
                        }
                        break;
                }
            }
        });
        
        // Add search functionality to wine tab
        const wineSearch = document.getElementById('wineSearch');
        if (wineSearch) {
            wineSearch.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 1) {
                    const results = this.services.search.search(query);
                    this.updateWineResults(results);
                }
            });
        }
    }
    
    focusSearch() {
        const searchInputs = document.querySelectorAll('input[type="text"]');
        if (searchInputs.length > 0) {
            searchInputs[0].focus();
        }
    }
    
    updateWineResults(results) {
        // Update wine display with search results
        const wineCategories = document.getElementById('wineCategories');
        if (wineCategories && results.length > 0) {
            // Implementation for updating wine results
            console.log('Search results:', results);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    window.app = new Table1837App();
}); 