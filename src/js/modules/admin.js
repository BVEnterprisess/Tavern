import { OCRService } from '../services/ocrService.js';

export class AdminModule {
    constructor(app) {
        this.app = app;
        this.state = app.state;
        this.elements = app.elements;
    }

    initialize() {
        this.setupMessageForm();
        this.setupOCRFunctionality();
    }

    setupMessageForm() {
        const adminMessageForm = document.getElementById('adminMessageForm');
        if (adminMessageForm) {
            adminMessageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMessageSubmit(e);
            });
        }
    }

    setupOCRFunctionality() {
        const fileUpload = document.getElementById('ocrFileUpload');
        const previewContainer = document.getElementById('ocrPreviewContainer');
        const resultContainer = document.getElementById('ocrResultContainer');
        const preview = document.getElementById('ocrPreview');
        const processBtn = document.getElementById('processOcrButton');
        const applyBtn = document.getElementById('applyOcrButton');
        
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }
        
        if (processBtn) {
            processBtn.addEventListener('click', () => {
                this.processOCR();
            });
        }
        
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyOCRResults();
            });
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('ocrPreview');
        const previewContainer = document.getElementById('ocrPreviewContainer');
        const resultContainer = document.getElementById('ocrResultContainer');
        
        if (file && preview && previewContainer && resultContainer) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                preview.src = e.target.result;
                previewContainer.classList.remove('hidden');
                resultContainer.classList.add('hidden');
            };
            
            reader.readAsDataURL(file);
        }
    }

    processOCR() {
        const preview = document.getElementById('ocrPreview');
        const resultContainer = document.getElementById('ocrResultContainer');
        const ocrResult = document.getElementById('ocrResult');
        
        if (!preview || !resultContainer || !ocrResult) return;
        
        // Simulate OCR processing
        this.simulateOCR(preview.src);
    }

    simulateOCR(imageSource) {
        const ocrResult = document.getElementById('ocrResult');
        const resultContainer = document.getElementById('ocrResultContainer');
        
        if (!ocrResult || !resultContainer) return;
        
        // In a real system, this would send the image to an OCR service
        // For demo purposes, we'll simulate extracting text with a timeout
        
        ocrResult.innerHTML = '<p class="text-center"><i class="fas fa-spinner fa-spin mr-2"></i> Processing image...</p>';
        resultContainer.classList.remove('hidden');
        
        setTimeout(() => {
            // Simulate detected wine information
            this.state.ocrData = {
                redWine: {
                    name: "INSIGNIA, JOSEPH PHELPS ESTATE",
                    region: "Napa Valley, CA, 2014",
                    price: "$305",
                    code: "R051"
                },
                whiteWine: {
                    name: "RAMEY, RUSSIAN RIVER VALLEY",
                    region: "California, 2021",
                    price: "$120",
                    code: "C016"
                },
                starters: [
                    "House-Made Charcuterie Board with Artisanal Cheeses",
                    "Seared Sea Scallops with Citrus Beurre Blanc"
                ],
                entrees: [
                    "Pan-Seared Duck Breast with Cherry Reduction",
                    "Wild Mushroom Risotto with Black Truffle"
                ],
                cocktail: {
                    name: "Barrel-Aged Manhattan",
                    description: "Aged bourbon, sweet vermouth, bitters",
                    price: "$14"
                }
            };
            
            // Display the results
            this.displayOCRResults();
        }, 1500);
    }
    
    displayOCRResults() {
        const ocrResult = document.getElementById('ocrResult');
        if (!ocrResult) return;
        
        const resultHtml = `
            <h4 class="font-bold text-yellow-400 mb-2">Featured Wines:</h4>
            <p><span class="font-semibold">Red:</span> ${this.state.ocrData.redWine.name} - ${this.state.ocrData.redWine.price} (${this.state.ocrData.redWine.code})</p>
            <p><span class="font-semibold">White:</span> ${this.state.ocrData.whiteWine.name} - ${this.state.ocrData.whiteWine.price} (${this.state.ocrData.whiteWine.code})</p>
            
            <h4 class="font-bold text-yellow-400 mt-4 mb-2">Starters:</h4>
            <ul class="list-disc pl-4 mb-2">
                ${this.state.ocrData.starters.map(item => `<li>${item}</li>`).join('')}
            </ul>
            
            <h4 class="font-bold text-yellow-400 mt-4 mb-2">Entrees:</h4>
            <ul class="list-disc pl-4 mb-2">
                ${this.state.ocrData.entrees.map(item => `<li>${item}</li>`).join('')}
            </ul>
            
            <h4 class="font-bold text-yellow-400 mt-4 mb-2">Featured Cocktail:</h4>
            <p>${this.state.ocrData.cocktail.name} - ${this.state.ocrData.cocktail.price}</p>
            <p class="text-sm text-gray-400">${this.state.ocrData.cocktail.description}</p>
        `;
        
        ocrResult.innerHTML = resultHtml;
    }
    
    applyOCRResults() {
        // Update featured wines on dashboard
        const featuredWines = document.querySelectorAll('.featured-wine');
        
        // Red wine
        if (this.state.ocrData.redWine && featuredWines[0]) {
            const redWineElement = featuredWines[0];
            const wineName = redWineElement.querySelector('p:nth-child(2)');
            const wineRegion = redWineElement.querySelector('p:nth-child(3)');
            const winePrice = redWineElement.querySelector('p:nth-child(4)');
            const wineCode = redWineElement.querySelector('p:nth-child(5)');
            
            if (wineName) wineName.textContent = this.state.ocrData.redWine.name;
            if (wineRegion) wineRegion.textContent = this.state.ocrData.redWine.region;
            if (winePrice) winePrice.textContent = this.state.ocrData.redWine.price;
            if (wineCode) wineCode.textContent = `(${this.state.ocrData.redWine.code})`;
        }
        
        // White wine
        if (this.state.ocrData.whiteWine && featuredWines[1]) {
            const whiteWineElement = featuredWines[1];
            const wineName = whiteWineElement.querySelector('p:nth-child(2)');
            const wineRegion = whiteWineElement.querySelector('p:nth-child(3)');
            const winePrice = whiteWineElement.querySelector('p:nth-child(4)');
            const wineCode = whiteWineElement.querySelector('p:nth-child(5)');
            
            if (wineName) wineName.textContent = this.state.ocrData.whiteWine.name;
            if (wineRegion) wineRegion.textContent = this.state.ocrData.whiteWine.region;
            if (winePrice) winePrice.textContent = this.state.ocrData.whiteWine.price;
            if (wineCode) wineCode.textContent = `(${this.state.ocrData.whiteWine.code})`;
        }
        
        // Update food specials
        if (this.state.ocrData.starters && this.state.ocrData.starters.length >= 2) {
            const foodSpecials = document.querySelectorAll('.food-special-card .grid div p');
            if (foodSpecials[0]) foodSpecials[0].textContent = this.state.ocrData.starters[0];
            if (foodSpecials[1]) foodSpecials[1].textContent = this.state.ocrData.starters[1] || '';
        }
        
        // Update entree as soup of the day
        if (this.state.ocrData.entrees && this.state.ocrData.entrees.length > 0) {
            const foodSpecials = document.querySelectorAll('.food-special-card .grid div p');
            if (foodSpecials[2]) foodSpecials[2].textContent = this.state.ocrData.entrees[0];
        }
        
        // Update cocktail special if today doesn't have a special
        const todaySpecial = document.getElementById('todaySpecial');
        if (this.state.ocrData.cocktail && todaySpecial && todaySpecial.textContent.includes('No special offerings today')) {
            todaySpecial.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <h4 class="text-xl font-bold">${this.state.ocrData.cocktail.name}</h4>
                    <span class="text-lg font-bold text-yellow-400">${this.state.ocrData.cocktail.price}</span>
                </div>
                <p class="text-gray-300">${this.state.ocrData.cocktail.description}</p>
            `;
        }
        
        alert('Dashboard updated successfully with OCR data!');
        
        // Reset OCR interface
        const fileUpload = document.getElementById('ocrFileUpload');
        const previewContainer = document.getElementById('ocrPreviewContainer');
        const resultContainer = document.getElementById('ocrResultContainer');
        
        if (fileUpload) fileUpload.value = '';
        if (previewContainer) previewContainer.classList.add('hidden');
        if (resultContainer) resultContainer.classList.add('hidden');
        
        // Switch to dashboard tab to show updates
        const dashboardTab = document.querySelector('[data-tab="dashboard"]');
        if (dashboardTab) dashboardTab.click();
    }

    handleMessageSubmit(event) {
        const name = document.getElementById('senderName').value;
        const subject = document.getElementById('messageSubject').value;
        const body = document.getElementById('messageBody').value;
        
        // Create mailto link
        const mailtoLink = `mailto:info@table1837.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name}\n\n${body}`)}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Reset form
        event.target.reset();
        
        alert('Email client opened. Please send the message from your email application.');
    }

    cleanup() {
        // Cleanup any resources if needed
    }
} 