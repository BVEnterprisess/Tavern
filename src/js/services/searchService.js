/**
 * Enhanced Search Service
 * Provides fast, fuzzy search capabilities
 */

export class SearchService {
    constructor() {
        this.searchIndex = new Map();
        this.buildIndex();
    }
    
    buildIndex() {
        // Build search index for wines
        const wines = this.getAllWines();
        wines.forEach((wine, index) => {
            const searchTerms = this.generateSearchTerms(wine);
            searchTerms.forEach(term => {
                if (!this.searchIndex.has(term)) {
                    this.searchIndex.set(term, []);
                }
                this.searchIndex.get(term).push(index);
            });
        });
    }
    
    generateSearchTerms(wine) {
        const terms = [];
        const text = `${wine.name} ${wine.region} ${wine.year} ${wine.category}`.toLowerCase();
        
        // Add full text
        terms.push(text);
        
        // Add individual words
        text.split(' ').forEach(word => {
            if (word.length > 2) {
                terms.push(word);
            }
        });
        
        // Add partial matches
        for (let i = 0; i < text.length - 2; i++) {
            terms.push(text.substring(i, i + 3));
        }
        
        return terms;
    }
    
    search(query, filters = {}) {
        if (!query || query.length < 2) return [];
        
        const results = new Set();
        const searchTerms = this.generateSearchTerms({ name: query });
        
        searchTerms.forEach(term => {
            const matches = this.searchIndex.get(term) || [];
            matches.forEach(index => results.add(index));
        });
        
        let filteredResults = Array.from(results).map(index => this.getAllWines()[index]);
        
        // Apply filters
        if (filters.category) {
            filteredResults = filteredResults.filter(wine => 
                wine.category.toLowerCase() === filters.category.toLowerCase()
            );
        }
        
        if (filters.priceRange) {
            filteredResults = filteredResults.filter(wine => 
                wine.price >= filters.priceRange.min && wine.price <= filters.priceRange.max
            );
        }
        
        return filteredResults.slice(0, 20); // Limit results
    }
    
    getAllWines() {
        // This would be replaced with actual wine data
        return [
            { name: 'CRISTOM, EILEEN VYD., PINOT NOIR', region: 'Eola-Amity Hills', year: '2019', category: 'red', price: 185 },
            { name: 'NEYERS, CARNEROS CHARDONNAY', region: 'Sonoma County', year: '2019', category: 'white', price: 100 },
            // Add more wines...
        ];
    }
}