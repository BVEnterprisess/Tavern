import { AuthService } from '../services/authService.js';

export class StaffModule {
    constructor(app) {
        this.app = app;
        this.state = app.state;
        this.elements = app.elements;
    }

    initialize() {
        this.display86Items();
        this.setupEventListeners();
        
        // Expose functions globally for onclick handlers
        window.add86Item = () => this.add86Item();
        window.remove86Item = (index) => this.remove86Item(index);
    }

    setupEventListeners() {
        // Event listener for adding 86'd items
        const item86Input = document.getElementById('item86Input');
        if (item86Input) {
            item86Input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.add86Item();
                }
            });
        }
    }

    add86Item() {
        const input = document.getElementById('item86Input');
        const item = input.value.trim();
        
        if (item) {
            this.state.items86.push({
                name: item,
                timestamp: new Date().toLocaleString(),
                addedBy: 'Current User'
            });
            
            localStorage.setItem('items86', JSON.stringify(this.state.items86));
            input.value = '';
            this.display86Items();
            this.load86Items(); // Update dashboard
        }
    }

    remove86Item(index) {
        this.state.items86.splice(index, 1);
        localStorage.setItem('items86', JSON.stringify(this.state.items86));
        this.display86Items();
        this.load86Items(); // Update dashboard
    }

    display86Items() {
        const current86Items = document.getElementById('current86Items');
        if (!current86Items) return;

        if (this.state.items86.length === 0) {
            current86Items.innerHTML = '<p class="text-gray-400">No items currently 86\'d</p>';
            return;
        }
        
        current86Items.innerHTML = this.state.items86.map((item, index) => `
            <div class="flex justify-between items-center p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg">
                <div>
                    <p class="font-semibold">${item.name}</p>
                    <p class="text-sm text-gray-400">Added: ${item.timestamp}</p>
                </div>
                <button onclick="remove86Item(${index})" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    load86Items() {
        const alert86List = document.getElementById('alert86List');
        if (!alert86List) return;

        if (this.state.items86.length === 0) {
            alert86List.innerHTML = '<p class="text-gray-300">No items currently 86\'d</p>';
            return;
        }
        
        alert86List.innerHTML = this.state.items86.map(item => `
            <div class="mb-2">
                <span class="font-semibold text-red-300">${item.name}</span>
                <span class="text-sm text-gray-400 ml-2">- ${item.timestamp}</span>
            </div>
        `).join('');
    }

    cleanup() {
        // Remove global functions
        delete window.add86Item;
        delete window.remove86Item;
    }
} 