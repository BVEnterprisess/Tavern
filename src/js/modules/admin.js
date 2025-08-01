import { UltraEnhancedOCRService } from '../services/ultraEnhancedOcrService.js';

export class AdminModule {
    constructor(app) {
        this.app = app;
        this.state = app.state;
        this.elements = app.elements;
        this.ocrService = new UltraEnhancedOCRService();
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
        
        // Set up progress callback
        this.ocrService.setProgressCallback(({ percent, message }) => {
            this.updateOCRProgress(percent, message);
        });
        
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
            // Optimize image before display
            this.optimizeImage(file).then(optimizedBlob => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    previewContainer.classList.remove('hidden');
                    resultContainer.classList.add('hidden');
                };
                
                reader.readAsDataURL(optimizedBlob);
            });
        }
    }

    async optimizeImage(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate optimal dimensions
                const maxWidth = 800;
                const maxHeight = 600;
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw optimized image
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    async processOCR() {
        const fileUpload = document.getElementById('ocrFileUpload');
        const processBtn = document.getElementById('processOcrButton');
        const resultContainer = document.getElementById('ocrResultContainer');
        const ocrResult = document.getElementById('ocrResult');
        
        if (!fileUpload.files[0]) {
            alert('Please select an image first.');
            return;
        }
        
        // Show loading state
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
        
        // Show processing message
        ocrResult.innerHTML = '<p class="text-center"><i class="fas fa-spinner fa-spin mr-2"></i> Processing image with enhanced OCR...</p>';
        resultContainer.classList.remove('hidden');
        
        const startTime = performance.now();
        
        try {
            // Use enhanced OCR service
            const result = await this.ocrService.processImage(fileUpload.files[0]);
            
            const processingTime = performance.now() - startTime;
            
            // Track performance
            if (this.app.services.monitor) {
                this.app.services.monitor.trackOCRProcessing(processingTime, result.confidence);
            }
            
            // Update state with results
            this.state.ocrData = {
                redWine: result.redWine,
                whiteWine: result.whiteWine,
                starters: result.starters || [],
                entrees: result.entrees || [],
                cocktail: result.cocktail,
                confidence: result.confidence
            };
            
            // Display the results
            this.displayOCRResults();
            
            // Show confidence score
            if (result.confidence) {
                this.showConfidenceScore(result.confidence);
            }
        } catch (error) {
            console.error('OCR processing failed:', error);
            ocrResult.innerHTML = '<p class="text-red-500">OCR processing failed. Please try again.</p>';
        } finally {
            // Reset button state
            processBtn.disabled = false;
            processBtn.innerHTML = '<i class="fas fa-magic mr-2"></i> Process Image';
        }
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
        
        let resultHtml = '<div class="space-y-4">';
        
        // Display wines with confidence indicators
        if (this.state.ocrData.redWine || this.state.ocrData.whiteWine) {
            resultHtml += '<h4 class="font-bold text-yellow-400 mb-2">Featured Wines:</h4>';
            
            if (this.state.ocrData.redWine) {
                const confidence = Math.round((this.state.ocrData.redWine.confidence || 0.9) * 100);
                const confidenceColor = confidence >= 97 ? 'text-green-400' : confidence >= 90 ? 'text-yellow-400' : 'text-red-400';
                resultHtml += `
                    <div class="bg-black bg-opacity-20 p-3 rounded-lg mb-2">
                        <p><span class="font-semibold">Red:</span> ${this.state.ocrData.redWine.name} - ${this.state.ocrData.redWine.price}</p>
                        <p class="text-sm text-gray-400">${this.state.ocrData.redWine.region} ${this.state.ocrData.redWine.year ? `(${this.state.ocrData.redWine.year})` : ''}</p>
                        <div class="flex items-center mt-1">
                            <span class="text-xs ${confidenceColor}">Confidence: ${confidence}%</span>
                        </div>
                    </div>
                `;
            }
            
            if (this.state.ocrData.whiteWine) {
                const confidence = Math.round((this.state.ocrData.whiteWine.confidence || 0.9) * 100);
                const confidenceColor = confidence >= 97 ? 'text-green-400' : confidence >= 90 ? 'text-yellow-400' : 'text-red-400';
                resultHtml += `
                    <div class="bg-black bg-opacity-20 p-3 rounded-lg mb-2">
                        <p><span class="font-semibold">White:</span> ${this.state.ocrData.whiteWine.name} - ${this.state.ocrData.whiteWine.price}</p>
                        <p class="text-sm text-gray-400">${this.state.ocrData.whiteWine.region} ${this.state.ocrData.whiteWine.year ? `(${this.state.ocrData.whiteWine.year})` : ''}</p>
                        <div class="flex items-center mt-1">
                            <span class="text-xs ${confidenceColor}">Confidence: ${confidence}%</span>
                        </div>
                    </div>
                `;
            }
        }
        
        // Display starters
        if (this.state.ocrData.starters && this.state.ocrData.starters.length > 0) {
            resultHtml += '<h4 class="font-bold text-yellow-400 mt-4 mb-2">Starters:</h4>';
            resultHtml += '<ul class="list-disc pl-4 mb-2">';
            this.state.ocrData.starters.forEach(item => {
                const name = typeof item === 'string' ? item : item.name;
                const confidence = typeof item === 'string' ? 0.9 : (item.confidence || 0.9);
                const confidencePercent = Math.round(confidence * 100);
                const confidenceColor = confidencePercent >= 97 ? 'text-green-400' : confidencePercent >= 90 ? 'text-yellow-400' : 'text-red-400';
                resultHtml += `
                    <li class="mb-1">
                        ${name}
                        <span class="text-xs ${confidenceColor} ml-2">(${confidencePercent}%)</span>
                    </li>
                `;
            });
            resultHtml += '</ul>';
        }
        
        // Display entrees
        if (this.state.ocrData.entrees && this.state.ocrData.entrees.length > 0) {
            resultHtml += '<h4 class="font-bold text-yellow-400 mt-4 mb-2">Entrees:</h4>';
            resultHtml += '<ul class="list-disc pl-4 mb-2">';
            this.state.ocrData.entrees.forEach(item => {
                const name = typeof item === 'string' ? item : item.name;
                const confidence = typeof item === 'string' ? 0.9 : (item.confidence || 0.9);
                const confidencePercent = Math.round(confidence * 100);
                const confidenceColor = confidencePercent >= 97 ? 'text-green-400' : confidencePercent >= 90 ? 'text-yellow-400' : 'text-red-400';
                resultHtml += `
                    <li class="mb-1">
                        ${name}
                        <span class="text-xs ${confidenceColor} ml-2">(${confidencePercent}%)</span>
                    </li>
                `;
            });
            resultHtml += '</ul>';
        }
        
        // Display cocktail
        if (this.state.ocrData.cocktail) {
            resultHtml += '<h4 class="font-bold text-yellow-400 mt-4 mb-2">Featured Cocktail:</h4>';
            const confidence = Math.round((this.state.ocrData.cocktail.confidence || 0.9) * 100);
            const confidenceColor = confidence >= 97 ? 'text-green-400' : confidence >= 90 ? 'text-yellow-400' : 'text-red-400';
            resultHtml += `
                <div class="bg-black bg-opacity-20 p-3 rounded-lg">
                    <p>${this.state.ocrData.cocktail.name} - ${this.state.ocrData.cocktail.price}</p>
                    <p class="text-sm text-gray-400">${this.state.ocrData.cocktail.description || ''}</p>
                    <div class="flex items-center mt-1">
                        <span class="text-xs ${confidenceColor}">Confidence: ${confidence}%</span>
                    </div>
                </div>
            `;
        }
        
        resultHtml += '</div>';
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
            if (wineCode) wineCode.textContent = `(${this.state.ocrData.redWine.code || 'N/A'})`;
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
            if (wineCode) wineCode.textContent = `(${this.state.ocrData.whiteWine.code || 'N/A'})`;
        }
        
        // Update food specials
        if (this.state.ocrData.starters && this.state.ocrData.starters.length >= 2) {
            const foodSpecials = document.querySelectorAll('.food-special-card .grid div p');
            const starter1 = typeof this.state.ocrData.starters[0] === 'string' ? 
                this.state.ocrData.starters[0] : this.state.ocrData.starters[0].name;
            const starter2 = typeof this.state.ocrData.starters[1] === 'string' ? 
                this.state.ocrData.starters[1] : this.state.ocrData.starters[1]?.name || '';
            
            if (foodSpecials[0]) foodSpecials[0].textContent = starter1;
            if (foodSpecials[1]) foodSpecials[1].textContent = starter2;
        }
        
        // Update entree as soup of the day
        if (this.state.ocrData.entrees && this.state.ocrData.entrees.length > 0) {
            const foodSpecials = document.querySelectorAll('.food-special-card .grid div p');
            const entree = typeof this.state.ocrData.entrees[0] === 'string' ? 
                this.state.ocrData.entrees[0] : this.state.ocrData.entrees[0].name;
            
            if (foodSpecials[2]) foodSpecials[2].textContent = entree;
        }
        
        // Show success message with confidence
        const overallConfidence = this.state.ocrData.confidence || 0.95;
        const confidencePercent = Math.round(overallConfidence * 100);
        const message = confidencePercent >= 97 ? 
            `OCR results applied successfully! (${confidencePercent}% accuracy)` :
            `OCR results applied successfully! (${confidencePercent}% accuracy - please verify)`;
        
        this.showToast(message, confidencePercent >= 97 ? 'success' : 'warning');
    }
    
    updateOCRProgress(percent, message) {
        const processBtn = document.getElementById('processOcrButton');
        const ocrResult = document.getElementById('ocrResult');
        
        if (processBtn) {
            processBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${message} (${percent}%)`;
        }
        
        if (ocrResult && percent < 100) {
            ocrResult.innerHTML = `<p class="text-center"><i class="fas fa-spinner fa-spin mr-2"></i> ${message} (${percent}%)</p>`;
        }
    }
    
    showConfidenceScore(confidence) {
        const confidencePercent = Math.round(confidence * 100);
        const confidenceColor = confidencePercent >= 97 ? 'text-green-400' : 
                               confidencePercent >= 90 ? 'text-yellow-400' : 'text-red-400';
        
        const confidenceHtml = `
            <div class="mt-4 p-3 bg-black bg-opacity-30 rounded-lg">
                <h4 class="font-bold ${confidenceColor} mb-2">OCR Confidence Score</h4>
                <div class="flex items-center">
                    <div class="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                        <div class="bg-green-500 h-2 rounded-full" style="width: ${confidencePercent}%"></div>
                    </div>
                    <span class="text-sm ${confidenceColor} font-bold">${confidencePercent}%</span>
                </div>
                <p class="text-xs text-gray-400 mt-1">
                    ${confidencePercent >= 97 ? 'Excellent accuracy!' : 
                      confidencePercent >= 90 ? 'Good accuracy' : 'Lower accuracy - please verify results'}
                </p>
            </div>
        `;
        
        const ocrResult = document.getElementById('ocrResult');
        if (ocrResult) {
            ocrResult.innerHTML += confidenceHtml;
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
        toast.className = `fixed bottom-4 right-4 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg z-50`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
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