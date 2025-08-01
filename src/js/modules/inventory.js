export class InventoryModule {
    constructor(app) {
        this.app = app;
        this.state = app.state;
        this.elements = app.elements;
        
        // Inventory data - exactly as in original
        this.inventory = {
            vodka: [
                'Zyr Vodka', '360 Double Chocolate Vodka', 'Western Sun Blueberry Vodka',
                'Absolut', 'Smirnoff Vanilla', 'Smirnoff Citrus', 'Smirnoff Vodka (Regular)',
                'Holla Vodka', 'Tito\'s', 'Gray Goose', 'Double Cross Vodka',
                'Kettle One', 'Kettle One Cucumber and Mint'
            ],
            gin: [
                'Hendrick\'s Gin', 'Bar Hill Gin', 'Whitley Neill Rhubarb and Ginger Gin',
                'Bombay Sapphire Dry Gin', 'Nolet\'s Dry Gin', 'Blue Coat Dry Gin',
                'Tanqueray Dry Gin', 'Beef Eater Dry Gin', 'Aviation American Gin'
            ],
            rum: [
                'Cruzan Blueberry Lemonade Rum', 'Gosling\'s Black Rum', 'Malibu Coconut Rum',
                'Captain Morgan Spiced Rum', 'Bacardi'
            ],
            tequila: [
                '21 Seed Cucumber Jalapeno Tequila', 'Jose Cuervo Silver', 'Jose Cuervo Gold',
                'Casamigos Mezcal', 'Casamigos Blanco', 'Coramino Reposado',
                'Agavales Blood Orange Blanco Tequila'
            ],
            whiskey: [
                'Knob Creek', 'Elijah Craig', 'Angels Envy', 'Dublin', 'Sycamore Rye',
                'Maker\'s Mark', 'Bullet Rye', 'Bullet Bourbon', 'Basil Hayden\'s Malted Rye',
                'Basil Hayden\'s Bourbon', 'Jack Daniels', 'Jim Bean', 'Woodford Reserve',
                'Watershed Distillery Straight Bourbon 4-Year', 'Dubliner', 'Canadian Club',
                'Seagrams Seven', 'Seagram\'s VO', 'Southern Comfort', 'Crown Royal Apple',
                'Crown Royal', 'Jameson', 'Red Breast Single Pot Still Irish Whiskey 12-Year',
                'Chivas', 'Highland Park 12-Year', 'Glenliet 12-Year', 'Glenfiddich 12-Year',
                'Balvini Doublewood 12-Year', 'Glenmorangie 12-Year', 'Macallen 12 Double Cask',
                'Dewars Scotch Whiskey White Label', 'Johnnie Walker Red', 'Johnnie Walker Black'
            ],
            cordials: [
                'Monin Blackberry', 'Monin Lavender', 'Monin Caramel', 'DeKuyper Sour Apple',
                'Peychaud\'s Bitters', 'Aromatic Bitters', 'Angostura Bitters', 'Dry Vermouth',
                'Sweet Vermouth', 'Saint Germain', 'Drambuie', 'Blue Curacao',
                'DeKuyper Butterscotch', 'DeKuyper Melon', 'DeKuyper Razmataz',
                'DeKuyper Watermelon Pucker', 'Jaquin\'s Creme de Cacao', 'Triple Sec',
                'Middle West Spirits Bourbon Cream', 'Disaronno Amaretto', 'Screwball',
                'Kahlua', 'Bailey\'s', 'RumChata', 'Frangelico', 'Sambuca', 'Luxardo',
                'Campari', 'Aperol', 'Cream to Violet', 'Contreau', 'Pama Pomegranate Liqueur'
            ]
        };
    }

    initialize() {
        this.initializeInventory();
        this.displayInventory();
        this.initializeVoiceRecognition();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Category filter functionality
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-filter').forEach(b => {
                    b.classList.remove('active', 'bg-dark-green');
                    b.classList.add('bg-gray-700');
                });
                e.target.classList.add('active', 'bg-dark-green');
                e.target.classList.remove('bg-gray-700');
                
                this.filterInventory(e.target.dataset.category);
            });
        });
        
        // Update inventory button
        const updateInventoryBtn = document.getElementById('updateInventoryBtn');
        if (updateInventoryBtn) {
            updateInventoryBtn.addEventListener('click', () => {
                this.saveInventory();
                alert('Inventory updated successfully!');
            });
        }
    }

    initializeInventory() {
        // Initialize inventory data if empty
        Object.keys(this.inventory).forEach(category => {
            this.inventory[category].forEach(item => {
                if (!this.state.inventoryData[item]) {
                    this.state.inventoryData[item] = {
                        bottles: 0,
                        ounces: 0,
                        category: category
                    };
                }
            });
        });
    }

    displayInventory(filter = 'all') {
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;

        const fragment = document.createDocumentFragment();
        
        Object.keys(this.inventory).forEach(category => {
            if (filter !== 'all' && filter !== category) return;
            
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'col-span-full';
            categoryHeader.innerHTML = `<h3 class="text-2xl font-bold mb-4 text-center capitalize text-yellow-400">${category}</h3>`;
            fragment.appendChild(categoryHeader);
            
            this.inventory[category].forEach(item => {
                const data = this.state.inventoryData[item] || { bottles: 0, ounces: 0, category: category };
                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                itemElement.innerHTML = `
                    <h4 class="font-semibold mb-3">${item}</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm text-gray-300 mb-1">Bottles</label>
                            <input type="number" 
                                   class="w-full px-3 py-2 bg-black bg-opacity-50 border border-gray-600 rounded focus:outline-none focus:border-green-600 text-white" 
                                   value="${data.bottles}" 
                                   data-item="${item}" 
                                   data-type="bottles"
                                   min="0">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-300 mb-1">Ounces</label>
                            <input type="number" 
                                   class="w-full px-3 py-2 bg-black bg-opacity-50 border border-gray-600 rounded focus:outline-none focus:border-green-600 text-white" 
                                   value="${data.ounces}" 
                                   data-item="${item}" 
                                   data-type="ounces"
                                   min="0"
                                   step="0.1">
                        </div>
                    </div>
                `;
                
                // Add event listeners to inputs
                const inputs = itemElement.querySelectorAll('input');
                inputs.forEach(input => {
                    input.addEventListener('change', (e) => {
                        const item = e.target.dataset.item;
                        const type = e.target.dataset.type;
                        const value = parseFloat(e.target.value) || 0;
                        
                        if (!this.state.inventoryData[item]) {
                            this.state.inventoryData[item] = { bottles: 0, ounces: 0, category: category };
                        }
                        
                        this.state.inventoryData[item][type] = value;
                    });
                });
                
                fragment.appendChild(itemElement);
            });
        });
        
        // Clear grid and append all elements at once
        grid.innerHTML = '';
        grid.appendChild(fragment);
    }

    filterInventory(category) {
        this.displayInventory(category);
    }

    saveInventory() {
        localStorage.setItem('inventoryData', JSON.stringify(this.state.inventoryData));
    }

    // Voice Recognition
    initializeVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            const voiceButton = document.getElementById('voiceButton');
            if (voiceButton) {
                voiceButton.disabled = true;
                voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i> Voice Not Supported';
            }
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.state.recognition = new SpeechRecognition();
        
        this.state.recognition.continuous = true;
        this.state.recognition.interimResults = true;
        this.state.recognition.lang = 'en-US';
        
        const voiceButton = document.getElementById('voiceButton');
        if (voiceButton) {
            voiceButton.addEventListener('click', () => this.toggleVoiceRecognition());
        }
        
        this.state.recognition.onresult = (event) => this.handleVoiceResult(event);
        this.state.recognition.onerror = (event) => this.handleVoiceError(event);
        this.state.recognition.onend = () => this.handleVoiceEnd();
    }
    
    toggleVoiceRecognition() {
        const voiceButton = document.getElementById('voiceButton');
        const voiceStatus = document.getElementById('voiceStatus');
        
        if (!this.state.isListening) {
            this.state.recognition.start();
            this.state.isListening = true;
            voiceStatus.classList.remove('hidden');
            voiceButton.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
            voiceButton.classList.add('bg-red-600');
        } else {
            this.state.recognition.stop();
            this.state.isListening = false;
            voiceStatus.classList.add('hidden');
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i> Voice Update';
            voiceButton.classList.remove('bg-red-600');
        }
    }
    
    handleVoiceResult(event) {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript.trim();
        
        // Show real-time transcription
        const voiceText = document.getElementById('voiceText');
        if (voiceText) {
            voiceText.textContent = transcript;
        }
        
        if (result.isFinal) {
            this.processVoiceInput(transcript);
        }
    }
    
    handleVoiceError(event) {
        console.error('Speech recognition error:', event.error);
        this.state.isListening = false;
        const voiceStatus = document.getElementById('voiceStatus');
        const voiceButton = document.getElementById('voiceButton');
        
        if (voiceStatus) voiceStatus.classList.add('hidden');
        if (voiceButton) {
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i> Voice Update';
            voiceButton.classList.remove('bg-red-600');
        }
        
        // Show error message
        alert(`Voice recognition error: ${event.error}. Please try again.`);
    }
    
    handleVoiceEnd() {
        if (this.state.isListening) {
            // If recognition ended but we still want to be listening, restart it
            this.state.recognition.start();
        }
    }
    
    processVoiceInput(transcript) {
        console.log('Processing voice input:', transcript);
        
        // Enhanced parsing logic with error handling
        try {
            const words = transcript.toLowerCase().split(' ');
            let bottles = 0;
            let ounces = 0;
            
            // Improved number extraction logic
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const number = parseFloat(word);
                
                if (!isNaN(number)) {
                    const nextWord = words[i + 1] || '';
                    if (nextWord.includes('bottle') || nextWord === 'bottles' || nextWord === 'bottle') {
                        bottles = number;
                    } else if (nextWord.includes('ounce') || nextWord.includes('oz') || nextWord === 'ounces') {
                        ounces = number;
                    }
                }
            }
            
            // Improved item name matching
            let bestMatchScore = 0;
            let bestMatchItem = null;
            
            Object.keys(this.state.inventoryData).forEach(item => {
                const itemWords = item.toLowerCase().split(' ');
                let matches = 0;
                let totalWords = 0;
                
                // Count how many words from the item name appear in the transcript
                itemWords.forEach(itemWord => {
                    if (itemWord.length > 2) { // Skip very short words
                        totalWords++;
                        if (transcript.toLowerCase().includes(itemWord)) {
                            matches++;
                        }
                    }
                });
                
                const score = totalWords > 0 ? matches / totalWords : 0;
                if (score > bestMatchScore && score > 0.4) { // Threshold to avoid false matches
                    bestMatchScore = score;
                    bestMatchItem = item;
                }
            });
            
            if (bestMatchItem && (bottles > 0 || ounces > 0)) {
                if (bottles > 0) {
                    this.state.inventoryData[bestMatchItem].bottles = bottles;
                }
                if (ounces > 0) {
                    this.state.inventoryData[bestMatchItem].ounces = ounces;
                }
                
                // Update the display
                this.updateInventoryDisplay(bestMatchItem, bottles, ounces);
                
                // Visual feedback
                this.showToast(`Updated ${bestMatchItem}: ${bottles > 0 ? `${bottles} bottles` : ''} ${ounces > 0 ? `${ounces} ounces` : ''}`);
            } else if (bestMatchItem) {
                // Found item but no quantity
                this.showToast(`Recognized ${bestMatchItem}, but no quantity detected. Please specify bottles or ounces.`);
            } else if (bottles > 0 || ounces > 0) {
                // Found quantity but no item
                this.showToast(`Quantity detected (${bottles > 0 ? `${bottles} bottles` : ''} ${ounces > 0 ? `${ounces} ounces` : ''}), but could not match a specific item. Please try again.`);
            } else {
                // Nothing matched
                this.showToast("Could not recognize inventory update. Please try again with item name and quantity.");
            }
        } catch (error) {
            console.error('Error processing voice input:', error);
            this.showToast('Error processing voice input. Please try again.');
        }
    }
    
    updateInventoryDisplay(item, bottles, ounces) {
        const inputs = document.querySelectorAll(`input[data-item="${item}"]`);
        inputs.forEach(input => {
            if (input.dataset.type === 'bottles' && bottles > 0) {
                input.value = bottles;
            } else if (input.dataset.type === 'ounces' && ounces > 0) {
                input.value = ounces;
            }
        });
    }
    
    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-dark-green text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-up';
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

    cleanup() {
        if (this.state.recognition) {
            this.state.recognition.stop();
        }
    }
} 