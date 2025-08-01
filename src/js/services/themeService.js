/**
 * Theme Management Service
 * Handles dark/light theme switching
 */

export class ThemeService {
    constructor() {
        this.currentTheme = localStorage.getItem('table1837-theme') || 'dark';
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
    }
    
    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('table1837-theme', theme);
        this.currentTheme = theme;
        
        // Update CSS variables
        const root = document.documentElement;
        if (theme === 'light') {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
        } else {
            root.style.setProperty('--bg-primary', '#000000');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.3)');
        }
    }
    
    setupThemeToggle() {
        // Add theme toggle button to header
        const header = document.querySelector('header');
        if (header) {
            const themeToggle = document.createElement('button');
            themeToggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
            themeToggle.className = 'theme-toggle ml-4 p-2 rounded-lg bg-opacity-20 hover:bg-opacity-30 transition-all';
            themeToggle.onclick = () => this.toggleTheme();
            header.querySelector('.container').appendChild(themeToggle);
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Update toggle button
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        // Show notification
        this.showThemeNotification(newTheme);
    }
    
    showThemeNotification(theme) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = `Switched to ${theme} theme`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}