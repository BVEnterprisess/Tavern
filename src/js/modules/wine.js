export class WineModule {
    constructor(app) {
        this.app = app;
        this.state = app.state;
        this.elements = app.elements;
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('wineSearch');
        const filterSelect = document.getElementById('wineFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterWines());
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterWines());
        }
    }

    filterWines() {
        const searchInput = document.getElementById('wineSearch');
        const filterSelect = document.getElementById('wineFilter');
        
        if (!searchInput || !filterSelect) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const filterCategory = filterSelect.value;
        
        const categories = document.querySelectorAll('.wine-category');
        
        categories.forEach(category => {
            const categoryType = category.classList.contains('red-wine') ? 'red' : 
                              category.classList.contains('white-wine') ? 'white' : 
                              category.classList.contains('sparkling-wine') ? 'sparkling' : '';
            
            let shouldShow = true;
            
            // Filter by category
            if (filterCategory && filterCategory !== categoryType) {
                shouldShow = false;
            }
            
            // Filter by search term
            if (searchTerm && shouldShow) {
                const categoryText = category.textContent.toLowerCase();
                shouldShow = categoryText.includes(searchTerm);
            }
            
            category.style.display = shouldShow ? 'block' : 'none';
        });
    }
} 