/**
 * Enhanced Cocktails Module with Supabase Integration
 * Features: Real-time updates, search, filtering, CRUD operations
 */

import { SupabaseService } from '../services/supabaseService.js';

class CocktailsManager {
    constructor() {
        this.supabaseService = new SupabaseService();
        this.currentCocktails = [];
        this.filteredCocktails = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.isInitialized = false;
        this.realtimeSubscription = null;
    }

    async initialize() {
        try {
            console.log('🍸 Initializing Cocktails Manager...');
            
            // Initialize Supabase service
            const supabaseConnected = await this.supabaseService.initialize();
            
            if (supabaseConnected) {
                console.log('✅ Connected to Supabase');
                this.setupRealtimeUpdates();
            } else {
                console.log('⚠️ Using fallback data (Supabase not available)');
            }
            
            // Load initial cocktails
            await this.loadCocktails();
            
            // Setup UI event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Cocktails Manager initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Cocktails Manager:', error);
            await this.loadFallbackCocktails();
        }
    }

    async loadCocktails() {
        try {
            this.currentCocktails = await this.supabaseService.getCocktails();
            this.filteredCocktails = [...this.currentCocktails];
            this.renderCocktails();
        } catch (error) {
            console.error('Error loading cocktails:', error);
            await this.loadFallbackCocktails();
        }
    }

    async loadFallbackCocktails() {
        this.currentCocktails = this.supabaseService.getFallbackCocktails();
        this.filteredCocktails = [...this.currentCocktails];
        this.renderCocktails();
    }

    setupRealtimeUpdates() {
        this.realtimeSubscription = this.supabaseService.subscribeToCocktails((payload) => {
            console.log('Real-time cocktail update received:', payload);
            this.handleRealtimeUpdate(payload);
        });
    }

    handleRealtimeUpdate(payload) {
        switch (payload.eventType) {
            case 'INSERT':
                this.currentCocktails.push(payload.new);
                break;
            case 'UPDATE':
                const updateIndex = this.currentCocktails.findIndex(c => c.id === payload.new.id);
                if (updateIndex !== -1) {
                    this.currentCocktails[updateIndex] = payload.new;
                }
                break;
            case 'DELETE':
                this.currentCocktails = this.currentCocktails.filter(c => c.id !== payload.old.id);
                break;
        }
        
        this.applyFiltersAndSearch();
        this.renderCocktails();
        this.showNotification('Cocktail menu updated in real-time!', 'success');
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('cocktailSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.applyFiltersAndSearch();
                this.renderCocktails();
            });
        }

        // Category filters
        const filterButtons = document.querySelectorAll('.cocktail-filter');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                this.currentFilter = e.target.dataset.filter;
                this.applyFiltersAndSearch();
                this.renderCocktails();
            });
        });

        // Add new cocktail button
        const addButton = document.getElementById('addCocktailBtn');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.showAddCocktailModal();
            });
        }
    }

    applyFiltersAndSearch() {
        let filtered = [...this.currentCocktails];

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(cocktail => cocktail.category === this.currentFilter);
        }

        // Apply search filter
        if (this.currentSearch) {
            filtered = filtered.filter(cocktail => 
                cocktail.name.toLowerCase().includes(this.currentSearch) ||
                cocktail.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes(this.currentSearch)
                ) ||
                cocktail.recipe.toLowerCase().includes(this.currentSearch)
            );
        }

        this.filteredCocktails = filtered;
    }

    renderCocktails() {
        const cocktailListDiv = document.getElementById('cocktailList');
        if (!cocktailListDiv) return;

        cocktailListDiv.innerHTML = '';

        if (this.filteredCocktails.length === 0) {
            cocktailListDiv.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-cocktail text-6xl text-gray-500 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-400 mb-2">No cocktails found</h3>
                    <p class="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        this.filteredCocktails.forEach(cocktail => {
            const cocktailCard = this.createCocktailCard(cocktail);
            cocktailListDiv.appendChild(cocktailCard);
        });

        // Update counter
        this.updateCocktailCounter();
    }

    createCocktailCard(cocktail) {
        const card = document.createElement('div');
        card.className = 'glass-panel p-6 rounded-lg hover:bg-opacity-80 transition-all duration-300';
        
        const difficultyColor = this.getDifficultyColor(cocktail.difficulty);
        const categoryColor = this.getCategoryColor(cocktail.category);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-2xl font-bold text-yellow-400">${cocktail.name}</h3>
                <div class="flex gap-2">
                    <span class="px-2 py-1 text-xs rounded-full ${categoryColor}">${cocktail.category}</span>
                    <span class="px-2 py-1 text-xs rounded-full ${difficultyColor}">${cocktail.difficulty}</span>
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-semibold mb-2 text-green-400">
                        <i class="fas fa-list-ul mr-2"></i>Ingredients:
                    </h4>
                    <ul class="list-disc list-inside text-gray-300 mb-4 space-y-1">
                        ${cocktail.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                    
                    <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span><i class="fas fa-clock mr-1"></i>${cocktail.prep_time} min</span>
                        <span><i class="fas fa-glass-martini mr-1"></i>${cocktail.glass_type}</span>
                        ${cocktail.garnish ? `<span><i class="fas fa-leaf mr-1"></i>${cocktail.garnish}</span>` : ''}
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-2 text-blue-400">
                        <i class="fas fa-magic mr-2"></i>Recipe:
                    </h4>
                    <p class="text-gray-300 text-sm leading-relaxed">${cocktail.recipe}</p>
                    
                    ${cocktail.notes ? `
                        <div class="mt-4 p-3 bg-black bg-opacity-30 rounded-lg">
                            <h5 class="font-semibold text-purple-400 mb-1">
                                <i class="fas fa-lightbulb mr-1"></i>Notes:
                            </h5>
                            <p class="text-gray-300 text-sm">${cocktail.notes}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700">
                <button onclick="cocktailsManager.editCocktail(${cocktail.id})" 
                        class="btn-secondary px-3 py-1 text-sm">
                    <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button onclick="cocktailsManager.deleteCocktail(${cocktail.id})" 
                        class="btn-danger px-3 py-1 text-sm">
                    <i class="fas fa-trash mr-1"></i>Delete
                </button>
            </div>
        `;
        
        return card;
    }

    getDifficultyColor(difficulty) {
        const colors = {
            easy: 'bg-green-600 text-white',
            medium: 'bg-yellow-600 text-white',
            hard: 'bg-red-600 text-white'
        };
        return colors[difficulty] || 'bg-gray-600 text-white';
    }

    getCategoryColor(category) {
        const colors = {
            classic: 'bg-blue-600 text-white',
            modern: 'bg-purple-600 text-white',
            refreshing: 'bg-green-600 text-white',
            tropical: 'bg-orange-600 text-white',
            spirit_forward: 'bg-red-600 text-white'
        };
        return colors[category] || 'bg-gray-600 text-white';
    }

    updateCocktailCounter() {
        const counter = document.getElementById('cocktailCounter');
        if (counter) {
            const total = this.currentCocktails.length;
            const filtered = this.filteredCocktails.length;
            counter.textContent = `${filtered} of ${total} cocktails`;
        }
    }

    async addCocktail(cocktailData) {
        try {
            const newCocktail = await this.supabaseService.addCocktail(cocktailData);
            this.currentCocktails.push(newCocktail);
            this.applyFiltersAndSearch();
            this.renderCocktails();
            this.showNotification('Cocktail added successfully!', 'success');
            return newCocktail;
        } catch (error) {
            console.error('Error adding cocktail:', error);
            this.showNotification('Failed to add cocktail', 'error');
            throw error;
        }
    }

    async editCocktail(id) {
        const cocktail = this.currentCocktails.find(c => c.id === id);
        if (!cocktail) return;
        
        this.showEditCocktailModal(cocktail);
    }

    async updateCocktail(id, updates) {
        try {
            const updatedCocktail = await this.supabaseService.updateCocktail(id, updates);
            const index = this.currentCocktails.findIndex(c => c.id === id);
            if (index !== -1) {
                this.currentCocktails[index] = updatedCocktail;
            }
            this.applyFiltersAndSearch();
            this.renderCocktails();
            this.showNotification('Cocktail updated successfully!', 'success');
            return updatedCocktail;
        } catch (error) {
            console.error('Error updating cocktail:', error);
            this.showNotification('Failed to update cocktail', 'error');
            throw error;
        }
    }

    async deleteCocktail(id) {
        if (!confirm('Are you sure you want to delete this cocktail?')) return;
        
        try {
            await this.supabaseService.deleteCocktail(id);
            this.currentCocktails = this.currentCocktails.filter(c => c.id !== id);
            this.applyFiltersAndSearch();
            this.renderCocktails();
            this.showNotification('Cocktail deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting cocktail:', error);
            this.showNotification('Failed to delete cocktail', 'error');
        }
    }

    showAddCocktailModal() {
        this.showCocktailModal({
            title: 'Add New Cocktail',
            cocktail: {
                name: '',
                ingredients: [''],
                recipe: '',
                category: 'classic',
                difficulty: 'medium',
                prepTime: 5,
                glassType: 'rocks',
                garnish: '',
                notes: ''
            },
            onSave: (cocktailData) => this.addCocktail(cocktailData)
        });
    }

    showEditCocktailModal(cocktail) {
        this.showCocktailModal({
            title: 'Edit Cocktail',
            cocktail: { ...cocktail },
            onSave: (cocktailData) => this.updateCocktail(cocktail.id, cocktailData)
        });
    }

    showCocktailModal({ title, cocktail, onSave }) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="glass-panel p-8 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">${title}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="cocktailForm" class="space-y-6">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Name</label>
                            <input type="text" name="name" value="${cocktail.name}" 
                                   class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Category</label>
                            <select name="category" class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white">
                                <option value="classic" ${cocktail.category === 'classic' ? 'selected' : ''}>Classic</option>
                                <option value="modern" ${cocktail.category === 'modern' ? 'selected' : ''}>Modern</option>
                                <option value="refreshing" ${cocktail.category === 'refreshing' ? 'selected' : ''}>Refreshing</option>
                                <option value="tropical" ${cocktail.category === 'tropical' ? 'selected' : ''}>Tropical</option>
                                <option value="spirit_forward" ${cocktail.category === 'spirit_forward' ? 'selected' : ''}>Spirit Forward</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Difficulty</label>
                            <select name="difficulty" class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white">
                                <option value="easy" ${cocktail.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                                <option value="medium" ${cocktail.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="hard" ${cocktail.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Prep Time (min)</label>
                            <input type="number" name="prepTime" value="${cocktail.prepTime || cocktail.prep_time || 5}" min="1" max="30"
                                   class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Glass Type</label>
                            <select name="glassType" class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white">
                                <option value="rocks" ${(cocktail.glassType || cocktail.glass_type) === 'rocks' ? 'selected' : ''}>Rocks</option>
                                <option value="coupe" ${(cocktail.glassType || cocktail.glass_type) === 'coupe' ? 'selected' : ''}>Coupe</option>
                                <option value="martini" ${(cocktail.glassType || cocktail.glass_type) === 'martini' ? 'selected' : ''}>Martini</option>
                                <option value="collins" ${(cocktail.glassType || cocktail.glass_type) === 'collins' ? 'selected' : ''}>Collins</option>
                                <option value="margarita" ${(cocktail.glassType || cocktail.glass_type) === 'margarita' ? 'selected' : ''}>Margarita</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Ingredients</label>
                        <div id="ingredientsList" class="space-y-2">
                            ${(cocktail.ingredients || []).map(ingredient => `
                                <div class="flex gap-2">
                                    <input type="text" value="${ingredient}" 
                                           class="flex-1 px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white ingredient-input">
                                    <button type="button" onclick="this.parentElement.remove()" class="px-3 py-3 bg-red-600 hover:bg-red-700 rounded-lg">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" onclick="addIngredientField()" class="mt-2 btn-secondary px-4 py-2 text-sm">
                            <i class="fas fa-plus mr-1"></i>Add Ingredient
                        </button>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Recipe</label>
                        <textarea name="recipe" rows="4" 
                                  class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white" required>${cocktail.recipe}</textarea>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Garnish</label>
                            <input type="text" name="garnish" value="${cocktail.garnish || ''}" 
                                   class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Notes</label>
                            <input type="text" name="notes" value="${cocktail.notes || ''}" 
                                   class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white">
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-4 pt-4 border-t border-gray-700">
                        <button type="button" onclick="this.closest('.fixed').remove()" class="btn-secondary px-6 py-2">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary px-6 py-2">
                            Save Cocktail
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup form submission
        const form = modal.querySelector('#cocktailForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const cocktailData = {
                name: formData.get('name'),
                ingredients: Array.from(form.querySelectorAll('.ingredient-input')).map(input => input.value).filter(Boolean),
                recipe: formData.get('recipe'),
                category: formData.get('category'),
                difficulty: formData.get('difficulty'),
                prepTime: parseInt(formData.get('prepTime')),
                glassType: formData.get('glassType'),
                garnish: formData.get('garnish'),
                notes: formData.get('notes')
            };
            
            onSave(cocktailData);
            modal.remove();
        });
        
        // Setup add ingredient function
        window.addIngredientField = () => {
            const ingredientsList = modal.querySelector('#ingredientsList');
            const newField = document.createElement('div');
            newField.className = 'flex gap-2';
            newField.innerHTML = `
                <input type="text" class="flex-1 px-4 py-3 bg-black bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:border-green-600 text-white ingredient-input">
                <button type="button" onclick="this.parentElement.remove()" class="px-3 py-3 bg-red-600 hover:bg-red-700 rounded-lg">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            ingredientsList.appendChild(newField);
        };
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`;
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async searchCocktails(query) {
        try {
            const results = await this.supabaseService.searchCocktails(query);
            this.filteredCocktails = results;
            this.renderCocktails();
            return results;
        } catch (error) {
            console.error('Error searching cocktails:', error);
            return [];
        }
    }

    async getCocktailsByCategory(category) {
        try {
            const results = await this.supabaseService.getCocktailsByCategory(category);
            this.filteredCocktails = results;
            this.renderCocktails();
            return results;
        } catch (error) {
            console.error('Error fetching cocktails by category:', error);
            return [];
        }
    }

    cleanup() {
        if (this.realtimeSubscription) {
            this.supabaseService.unsubscribeFromCocktails();
        }
    }
}

// Initialize the cocktails manager
const cocktailsManager = new CocktailsManager();

// Export for use in other modules
export { cocktailsManager };

// Legacy function for backward compatibility
export function loadCocktails() {
    if (cocktailsManager.isInitialized) {
        cocktailsManager.renderCocktails();
    } else {
        cocktailsManager.initialize();
    }
}
