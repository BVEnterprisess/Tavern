import { createWorker } from 'tesseract.js';

class OCRService {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            this.worker = await createWorker('eng');
            this.isInitialized = true;
            console.log('OCR Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OCR service:', error);
            throw error;
        }
    }

    async processImage(imageFile) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const { data: { text } } = await this.worker.recognize(imageFile);
            return this.parseMenuText(text);
        } catch (error) {
            console.error('OCR processing failed:', error);
            throw error;
        }
    }

    parseMenuText(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const result = {
            redWine: null,
            whiteWine: null,
            starters: [],
            entrees: [],
            cocktail: null,
            specials: []
        };

        let currentSection = null;

        for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            // Detect sections
            if (cleanLine.toLowerCase().includes('red wine') || cleanLine.toLowerCase().includes('pinot noir')) {
                currentSection = 'redWine';
            } else if (cleanLine.toLowerCase().includes('white wine') || cleanLine.toLowerCase().includes('chardonnay')) {
                currentSection = 'whiteWine';
            } else if (cleanLine.toLowerCase().includes('starter') || cleanLine.toLowerCase().includes('appetizer')) {
                currentSection = 'starters';
            } else if (cleanLine.toLowerCase().includes('entree') || cleanLine.toLowerCase().includes('main')) {
                currentSection = 'entrees';
            } else if (cleanLine.toLowerCase().includes('cocktail') || cleanLine.toLowerCase().includes('drink')) {
                currentSection = 'cocktail';
            } else if (cleanLine.toLowerCase().includes('special') || cleanLine.toLowerCase().includes('featured')) {
                currentSection = 'specials';
            }

            // Parse wine information
            if (currentSection === 'redWine' && !result.redWine && this.isWineLine(cleanLine)) {
                result.redWine = this.parseWineLine(cleanLine);
            } else if (currentSection === 'whiteWine' && !result.whiteWine && this.isWineLine(cleanLine)) {
                result.whiteWine = this.parseWineLine(cleanLine);
            }

            // Parse food items
            if (currentSection === 'starters' && this.isFoodLine(cleanLine)) {
                result.starters.push(cleanLine);
            } else if (currentSection === 'entrees' && this.isFoodLine(cleanLine)) {
                result.entrees.push(cleanLine);
            }

            // Parse cocktail
            if (currentSection === 'cocktail' && this.isCocktailLine(cleanLine)) {
                result.cocktail = this.parseCocktailLine(cleanLine);
            }

            // Parse specials
            if (currentSection === 'specials' && this.isSpecialLine(cleanLine)) {
                result.specials.push(cleanLine);
            }
        }

        return result;
    }

    isWineLine(line) {
        const wineKeywords = ['pinot noir', 'merlot', 'cabernet', 'chardonnay', 'sauvignon', 'riesling'];
        return wineKeywords.some(keyword => line.toLowerCase().includes(keyword));
    }

    parseWineLine(line) {
        // Extract wine name, region, year, and price
        const priceMatch = line.match(/\$(\d+)/);
        const yearMatch = line.match(/(\d{4})/);
        const price = priceMatch ? `$${priceMatch[1]}` : '$0';
        const year = yearMatch ? yearMatch[1] : '';
        
        // Extract wine name (everything before the region/year)
        let name = line;
        if (year) {
            name = line.split(year)[0].trim();
        }
        
        return {
            name: name,
            region: line.includes(',') ? line.split(',').slice(1).join(',').trim() : '',
            year: year,
            price: price
        };
    }

    isFoodLine(line) {
        return line.length > 5 && !line.match(/^\d+$/) && !line.match(/^\$\d+/);
    }

    isCocktailLine(line) {
        const cocktailKeywords = ['cocktail', 'manhattan', 'martini', 'margarita', 'old fashioned'];
        return cocktailKeywords.some(keyword => line.toLowerCase().includes(keyword));
    }

    parseCocktailLine(line) {
        const priceMatch = line.match(/\$(\d+)/);
        const price = priceMatch ? `$${priceMatch[1]}` : '$0';
        
        return {
            name: line.split('$')[0].trim(),
            price: price,
            description: line.includes('with') ? line.split('with')[1].trim() : ''
        };
    }

    isSpecialLine(line) {
        return line.toLowerCase().includes('special') || line.toLowerCase().includes('featured');
    }

    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
        }
    }
}

export default new OCRService(); 