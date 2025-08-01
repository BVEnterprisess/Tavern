import { OCRService } from './services/ocrService.js';
import { AuthService } from './services/authService.js';
import { DashboardModule } from './modules/dashboard.js';
import { StaffModule } from './modules/staff.js';
import { AdminModule } from './modules/admin.js';
import { WineModule } from './modules/wine.js';
import { InventoryModule } from './modules/inventory.js';

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
        
        // Expose functions globally for onclick handlers
        window.logout = () => this.logout();
    }

    init() {
        this.cacheElements();
        this.initializeModules();
        this.setupEventListeners();
        this.setupNavigation();
    }

    cacheElements() {
        const ids = ['alert86List', 'current86Items', 'todaySpecial', 'inventoryGrid', 
                    'voiceStatus', 'voiceText', 'ocrPreview', 'ocrResult'];
        
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    initializeModules() {
        this.modules.dashboard = new DashboardModule(this);
        this.modules.staff = new StaffModule(this);
        this.modules.admin = new AdminModule(this);
        this.modules.wine = new WineModule(this);
        this.modules.inventory = new InventoryModule(this);
        
        // Initialize all modules
        Object.values(this.modules).forEach(module => {
            if (module.initialize) {
                module.initialize();
            }
        });
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

    showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
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
            if (module.cleanup) {
                module.cleanup();
            }
        });
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
        toast.className = `fixed bottom-4 right-4 bg-dark-green text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-up`;
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
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    window.app = new Table1837App();
}); 