/**
 * Supabase Service for Cocktail Management
 * Handles all database operations for cocktails with real-time updates
 */

import { createClient } from '@supabase/supabase-js';

export class SupabaseService {
    constructor() {
        // Initialize Supabase client
        this.supabase = createClient(
            'https://lontanjfuxuevvqqupsl.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFhYmFzZSIsInJlZiI6ImxvbnRhbmpmdXh1ZXZ2cXF1cHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTIzNzcsImV4cCI6MjA2OTkyODM3N30.watvIC_05bZChqJ-7U4m5iRe1JIZ-XyaQRQMCcOGmic'
        );
        
        this.isConnected = false;
        this.realtimeSubscription = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    async initialize() {
        try {
            // Test connection
            const { data, error } = await this.supabase
                .from('cocktails')
                .select('count')
                .limit(1);
            
            if (error) {
                console.warn('Supabase connection test failed:', error);
                return false;
            }
            
            this.isConnected = true;
            console.log('✅ Supabase service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase service:', error);
            return false;
        }
    }

    // CRUD Operations for Cocktails
    async getCocktails() {
        try {
            const { data, error } = await this.supabase
                .from('cocktails')
                .select('*')
                .order('name');
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('Error fetching cocktails:', error);
            return this.getFallbackCocktails();
        }
    }

    async addCocktail(cocktail) {
        try {
            const { data, error } = await this.supabase
                .from('cocktails')
                .insert([{
                    name: cocktail.name,
                    ingredients: cocktail.ingredients,
                    recipe: cocktail.recipe,
                    category: cocktail.category || 'classic',
                    difficulty: cocktail.difficulty || 'medium',
                    prep_time: cocktail.prepTime || 5,
                    glass_type: cocktail.glassType || 'rocks',
                    garnish: cocktail.garnish || '',
                    notes: cocktail.notes || '',
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (error) throw error;
            
            console.log('✅ Cocktail added successfully:', data[0]);
            return data[0];
        } catch (error) {
            console.error('Error adding cocktail:', error);
            throw error;
        }
    }

    async updateCocktail(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('cocktails')
                .update(updates)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            
            console.log('✅ Cocktail updated successfully:', data[0]);
            return data[0];
        } catch (error) {
            console.error('Error updating cocktail:', error);
            throw error;
        }
    }

    async deleteCocktail(id) {
        try {
            const { error } = await this.supabase
                .from('cocktails')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            console.log('✅ Cocktail deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting cocktail:', error);
            throw error;
        }
    }

    async searchCocktails(query) {
        try {
            const { data, error } = await this.supabase
                .from('cocktails')
                .select('*')
                .or(`name.ilike.%${query}%,ingredients.ilike.%${query}%,recipe.ilike.%${query}%`)
                .order('name');
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('Error searching cocktails:', error);
            return [];
        }
    }

    async getCocktailsByCategory(category) {
        try {
            const { data, error } = await this.supabase
                .from('cocktails')
                .select('*')
                .eq('category', category)
                .order('name');
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('Error fetching cocktails by category:', error);
            return [];
        }
    }

    // Real-time subscriptions
    subscribeToCocktails(callback) {
        if (this.realtimeSubscription) {
            this.supabase.removeChannel(this.realtimeSubscription);
        }

        this.realtimeSubscription = this.supabase
            .channel('cocktails_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'cocktails' },
                (payload) => {
                    console.log('Real-time cocktail update:', payload);
                    callback(payload);
                }
            )
            .subscribe();

        return this.realtimeSubscription;
    }

    unsubscribeFromCocktails() {
        if (this.realtimeSubscription) {
            this.supabase.removeChannel(this.realtimeSubscription);
            this.realtimeSubscription = null;
        }
    }

    // Fallback data when Supabase is unavailable
    getFallbackCocktails() {
        return [
            {
                id: 1,
                name: "Old Fashioned",
                ingredients: [
                    "2 oz Bourbon or Rye Whiskey",
                    "1/2 oz Simple Syrup",
                    "2 dashes Angostura Bitters",
                    "Orange peel for garnish"
                ],
                recipe: "Combine whiskey, simple syrup, and bitters in a mixing glass with ice. Stir until well-chilled. Strain into a rocks glass over a large ice cube. Express the oil from an orange peel over the drink and drop it in.",
                category: "classic",
                difficulty: "easy",
                prep_time: 5,
                glass_type: "rocks",
                garnish: "Orange peel",
                notes: "A timeless classic that showcases the whiskey",
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: "Margarita",
                ingredients: [
                    "2 oz Tequila (Blanco or Reposado)",
                    "1 oz Fresh Lime Juice",
                    "3/4 oz Orange Liqueur (Cointreau or Triple Sec)",
                    "Salt for rim (optional)",
                    "Lime wedge for garnish"
                ],
                recipe: "If desired, salt the rim of a chilled margarita glass. Combine tequila, lime juice, and orange liqueur in a shaker with ice. Shake well until thoroughly chilled. Strain into the prepared glass. Garnish with a lime wedge.",
                category: "classic",
                difficulty: "medium",
                prep_time: 4,
                glass_type: "margarita",
                garnish: "Lime wedge",
                notes: "Perfect balance of sweet, sour, and tequila",
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                name: "Mojito",
                ingredients: [
                    "2 oz White Rum",
                    "1 oz Fresh Lime Juice",
                    "2 tsp Granulated Sugar",
                    "6-8 Fresh Mint Leaves",
                    "Soda Water",
                    "Mint sprig and lime wedge for garnish"
                ],
                recipe: "In a sturdy glass, gently muddle the mint leaves with lime juice and sugar. Add rum and fill the glass with crushed ice. Top with soda water and stir gently. Garnish with a mint sprig and lime wedge.",
                category: "refreshing",
                difficulty: "medium",
                prep_time: 6,
                glass_type: "collins",
                garnish: "Mint sprig, lime wedge",
                notes: "Refreshing and perfect for warm weather",
                created_at: new Date().toISOString()
            },
            {
                id: 4,
                name: "Negroni",
                ingredients: [
                    "1 oz Gin",
                    "1 oz Campari",
                    "1 oz Sweet Vermouth",
                    "Orange slice for garnish"
                ],
                recipe: "Combine gin, Campari, and sweet vermouth in a mixing glass with ice. Stir until well-chilled. Strain into a rocks glass over a large ice cube. Garnish with an orange slice.",
                category: "classic",
                difficulty: "easy",
                prep_time: 3,
                glass_type: "rocks",
                garnish: "Orange slice",
                notes: "Bitter, complex, and sophisticated",
                created_at: new Date().toISOString()
            },
            {
                id: 5,
                name: "Espresso Martini",
                ingredients: [
                    "1.5 oz Vodka",
                    "1 oz Coffee Liqueur",
                    "1 oz Freshly Brewed Espresso (chilled)",
                    "0.5 oz Simple Syrup (optional, to taste)",
                    "Coffee beans for garnish"
                ],
                recipe: "Combine vodka, coffee liqueur, espresso, and simple syrup (if using) in a shaker with ice. Shake vigorously until well-chilled and a frothy layer forms. Double strain into a chilled coupe or martini glass. Garnish with three coffee beans.",
                category: "modern",
                difficulty: "hard",
                prep_time: 8,
                glass_type: "coupe",
                garnish: "Coffee beans",
                notes: "Perfect after-dinner cocktail with a caffeine kick",
                created_at: new Date().toISOString()
            }
        ];
    }

    // Utility methods
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('cocktails')
                .select('count')
                .limit(1);
            
            return !error;
        } catch (error) {
            return false;
        }
    }

    getConnectionStatus() {
        return this.isConnected;
    }

    // Error handling with retry logic
    async retryOperation(operation, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
}
