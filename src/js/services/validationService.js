/**
 * Comprehensive Input Validation Service
 * Provides robust validation for all user inputs
 */

export class ValidationService {
    constructor() {
        this.validationRules = new Map();
        this.customValidators = new Map();
        this.init();
    }

    init() {
        this.setupDefaultRules();
        this.setupCustomValidators();
    }

    setupDefaultRules() {
        // Email validation
        this.validationRules.set('email', {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        });

        // Password validation
        this.validationRules.set('password', {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
            message: 'Password must be at least 8 characters with letters and numbers'
        });

        // Phone number validation
        this.validationRules.set('phone', {
            pattern: /^[\+]?[1-9][\d]{0,15}$/,
            message: 'Please enter a valid phone number'
        });

        // Price validation
        this.validationRules.set('price', {
            pattern: /^\$?\d+(\.\d{2})?$/,
            message: 'Please enter a valid price (e.g., $10.50 or 10.50)'
        });

        // Wine name validation
        this.validationRules.set('wineName', {
            pattern: /^[A-Za-z0-9\s\-\.\,\&\'\(\)]+$/,
            message: 'Wine name contains invalid characters'
        });

        // Year validation
        this.validationRules.set('year', {
            pattern: /^(19|20)\d{2}$/,
            message: 'Please enter a valid year between 1900 and 2099'
        });

        // General text validation
        this.validationRules.set('text', {
            pattern: /^[A-Za-z0-9\s\-\.\,\&\'\(\)\?\!]+$/,
            message: 'Text contains invalid characters'
        });
    }

    setupCustomValidators() {
        // Custom validator for wine data
        this.customValidators.set('wineData', (data) => {
            const errors = [];
            
            if (!data.name || data.name.trim().length < 2) {
                errors.push('Wine name is required and must be at least 2 characters');
            }
            
            if (data.price && !this.validate('price', data.price)) {
                errors.push('Invalid price format');
            }
            
            if (data.year && !this.validate('year', data.year.toString())) {
                errors.push('Invalid year format');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        });

        // Custom validator for inventory item
        this.customValidators.set('inventoryItem', (data) => {
            const errors = [];
            
            if (!data.name || data.name.trim().length < 2) {
                errors.push('Item name is required and must be at least 2 characters');
            }
            
            if (data.category && !['vodka', 'gin', 'rum', 'tequila', 'whiskey', 'cordials'].includes(data.category)) {
                errors.push('Invalid category');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        });

        // Custom validator for OCR data
        this.customValidators.set('ocrData', (data) => {
            const errors = [];
            
            if (data.redWine && !this.validate('wineData', data.redWine).isValid) {
                errors.push('Invalid red wine data');
            }
            
            if (data.whiteWine && !this.validate('wineData', data.whiteWine).isValid) {
                errors.push('Invalid white wine data');
            }
            
            if (data.starters && !Array.isArray(data.starters)) {
                errors.push('Starters must be an array');
            }
            
            if (data.entrees && !Array.isArray(data.entrees)) {
                errors.push('Entrees must be an array');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        });
    }

    validate(type, value) {
        if (!value) {
            return {
                isValid: false,
                error: 'Value is required'
            };
        }

        const rule = this.validationRules.get(type);
        if (!rule) {
            return {
                isValid: true,
                error: null
            };
        }

        const isValid = rule.pattern.test(value);
        return {
            isValid: isValid,
            error: isValid ? null : rule.message
        };
    }

    validateCustom(type, data) {
        const validator = this.customValidators.get(type);
        if (!validator) {
            return {
                isValid: true,
                errors: []
            };
        }

        return validator(data);
    }

    sanitizeInput(input, type = 'text') {
        if (typeof input !== 'string') {
            return '';
        }

        let sanitized = input.trim();

        // Remove potentially dangerous characters
        sanitized = sanitized
            .replace(/[<>]/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove JavaScript protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .replace(/eval\s*\(/gi, '') // Remove eval
            .replace(/document\./gi, '') // Remove document access
            .replace(/window\./gi, ''); // Remove window access

        // Type-specific sanitization
        switch (type) {
            case 'email':
                sanitized = sanitized.toLowerCase();
                break;
            case 'price':
                sanitized = sanitized.replace(/[^\d\.\$]/g, '');
                break;
            case 'year':
                sanitized = sanitized.replace(/[^\d]/g, '');
                break;
            case 'phone':
                sanitized = sanitized.replace(/[^\d\+\-\(\)\s]/g, '');
                break;
        }

        return sanitized;
    }

    validateForm(formData) {
        const errors = {};
        const sanitizedData = {};

        for (const [field, value] of Object.entries(formData)) {
            const sanitized = this.sanitizeInput(value, this.getFieldType(field));
            sanitizedData[field] = sanitized;

            const validation = this.validate(this.getFieldType(field), sanitized);
            if (!validation.isValid) {
                errors[field] = validation.error;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors,
            sanitizedData: sanitizedData
        };
    }

    getFieldType(fieldName) {
        const fieldTypeMap = {
            'email': 'email',
            'username': 'email',
            'password': 'password',
            'phone': 'phone',
            'price': 'price',
            'year': 'year',
            'wineName': 'wineName',
            'name': 'text',
            'description': 'text'
        };

        return fieldTypeMap[fieldName] || 'text';
    }

    validateWineData(wineData) {
        return this.validateCustom('wineData', wineData);
    }

    validateInventoryItem(itemData) {
        return this.validateCustom('inventoryItem', itemData);
    }

    validateOCRData(ocrData) {
        return this.validateCustom('ocrData', ocrData);
    }

    // Real-time validation for form fields
    setupRealTimeValidation(formElement) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateField(field) {
        const fieldType = this.getFieldType(field.name);
        const value = field.value;
        
        const validation = this.validate(fieldType, value);
        
        if (!validation.isValid) {
            this.showFieldError(field, validation.error);
        } else {
            this.clearFieldError(field);
        }
        
        return validation.isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-red-500 text-sm mt-1';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        field.classList.add('border-red-500');
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('border-red-500');
    }

    // Batch validation for multiple fields
    validateBatch(fields) {
        const results = {};
        let allValid = true;

        for (const [fieldName, value] of Object.entries(fields)) {
            const fieldType = this.getFieldType(fieldName);
            const validation = this.validate(fieldType, value);
            
            results[fieldName] = validation;
            
            if (!validation.isValid) {
                allValid = false;
            }
        }

        return {
            allValid: allValid,
            results: results
        };
    }
}