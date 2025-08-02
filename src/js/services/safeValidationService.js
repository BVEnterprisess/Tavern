/**
 * SAFE Validation Service with Timeouts and Limits
 */

export class SafeValidationService {
    constructor() {
        this.maxInputLength = 1000;
        this.regexTimeout = 1000; // 1 second timeout
        this.maxValidationTime = 5000; // 5 seconds max
        this.validationCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        this.validationRules = new Map();
        this.customValidators = new Map();
        this.circuitBreaker = {
            failures: 0,
            lastFailureTime: 0,
            state: 'CLOSED',
            threshold: 5,
            timeout: 30000
        };
        
        this.init();
    }

    init() {
        this.setupDefaultRules();
        this.setupCustomValidators();
        
        // Cleanup cache periodically
        setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
    }

    setupDefaultRules() {
        // Email validation with timeout protection
        this.validationRules.set('email', {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address',
            maxLength: 100
        });

        // Password validation with limits
        this.validationRules.set('password', {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
            message: 'Password must be at least 8 characters with letters and numbers',
            maxLength: 100
        });

        // Phone number validation
        this.validationRules.set('phone', {
            pattern: /^[\+]?[1-9][\d]{0,15}$/,
            message: 'Please enter a valid phone number',
            maxLength: 20
        });

        // Price validation with limits
        this.validationRules.set('price', {
            pattern: /^\$?\d+(\.\d{2})?$/,
            message: 'Please enter a valid price (e.g., $10.50 or 10.50)',
            maxLength: 20
        });

        // Wine name validation with limits
        this.validationRules.set('wineName', {
            pattern: /^[A-Za-z0-9\s\-\.\,\&\'\(\)]+$/,
            message: 'Wine name contains invalid characters',
            maxLength: 100
        });

        // Year validation
        this.validationRules.set('year', {
            pattern: /^(19|20)\d{2}$/,
            message: 'Please enter a valid year between 1900 and 2099',
            maxLength: 4
        });

        // General text validation with limits
        this.validationRules.set('text', {
            pattern: /^[A-Za-z0-9\s\-\.\,\&\'\(\)\?\!]+$/,
            message: 'Text contains invalid characters',
            maxLength: 500
        });
    }

    setupCustomValidators() {
        // Custom validator for wine data with limits
        this.customValidators.set('wineData', (data) => {
            const errors = [];
            
            if (!data.name || data.name.trim().length < 2) {
                errors.push('Wine name is required and must be at least 2 characters');
            }
            
            if (data.name && data.name.length > 100) {
                errors.push('Wine name is too long (max 100 characters)');
            }
            
            if (data.price && !this.validate('price', data.price).isValid) {
                errors.push('Invalid price format');
            }
            
            if (data.year && !this.validate('year', data.year.toString()).isValid) {
                errors.push('Invalid year format');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        });

        // Custom validator for inventory item with limits
        this.customValidators.set('inventoryItem', (data) => {
            const errors = [];
            
            if (!data.name || data.name.trim().length < 2) {
                errors.push('Item name is required and must be at least 2 characters');
            }
            
            if (data.name && data.name.length > 100) {
                errors.push('Item name is too long (max 100 characters)');
            }
            
            if (data.category && !['vodka', 'gin', 'rum', 'tequila', 'whiskey', 'cordials'].includes(data.category)) {
                errors.push('Invalid category');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        });
    }

    async validate(type, value) {
        try {
            // Circuit breaker check
            if (this.circuitBreaker.state === 'OPEN') {
                if (Date.now() - this.circuitBreaker.lastFailureTime > this.circuitBreaker.timeout) {
                    this.circuitBreaker.state = 'HALF_OPEN';
                } else {
                    return {
                        isValid: false,
                        error: 'Validation service temporarily unavailable'
                    };
                }
            }

            // Input length check
            if (!value) {
                return {
                    isValid: false,
                    error: 'Value is required'
                };
            }

            if (typeof value === 'string' && value.length > this.maxInputLength) {
                return {
                    isValid: false,
                    error: `Input too long (max ${this.maxInputLength} characters)`
                };
            }

            // Cache check
            const cacheKey = `${type}_${value}`;
            const cached = this.validationCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.result;
            }

            const rule = this.validationRules.get(type);
            if (!rule) {
                return {
                    isValid: true,
                    error: null
                };
            }

            // Length check for specific type
            if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
                return {
                    isValid: false,
                    error: `Input too long (max ${rule.maxLength} characters)`
                };
            }

            // Validate with timeout protection
            const result = await this.validateWithTimeout(rule.pattern, value);
            
            const validationResult = {
                isValid: result,
                error: result ? null : rule.message
            };

            // Cache result
            this.validationCache.set(cacheKey, {
                result: validationResult,
                timestamp: Date.now()
            });

            this.recordSuccess();
            return validationResult;

        } catch (error) {
            this.recordFailure();
            return {
                isValid: false,
                error: 'Validation failed due to system error'
            };
        }
    }

    async validateWithTimeout(pattern, input, timeout = this.regexTimeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Validation timeout'));
            }, timeout);

            try {
                const result = pattern.test(input);
                clearTimeout(timer);
                resolve(result);
            } catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }

    validateCustom(type, data) {
        try {
            const validator = this.customValidators.get(type);
            if (!validator) {
                return {
                    isValid: true,
                    errors: []
                };
            }

            return validator(data);
        } catch (error) {
            this.recordFailure();
            return {
                isValid: false,
                errors: ['Validation failed due to system error']
            };
        }
    }

    sanitizeInput(input, type = 'text') {
        if (typeof input !== 'string') {
            return '';
        }

        // Length limit
        if (input.length > this.maxInputLength) {
            input = input.substring(0, this.maxInputLength);
        }

        // Remove potentially dangerous characters
        let sanitized = input
            .replace(/[<>]/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove JavaScript protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .replace(/eval\s*\(/gi, '') // Remove eval
            .replace(/document\./gi, '') // Remove document access
            .replace(/window\./gi, '') // Remove window access
            .trim();

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

    // Real-time validation with limits
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
        
        // Length check
        if (value.length > this.maxInputLength) {
            this.showFieldError(field, `Input too long (max ${this.maxInputLength} characters)`);
            return false;
        }
        
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

    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.validationCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.validationCache.delete(key);
            }
        }
    }

    recordSuccess() {
        this.circuitBreaker.failures = 0;
        this.circuitBreaker.state = 'CLOSED';
    }

    recordFailure() {
        this.circuitBreaker.failures++;
        this.circuitBreaker.lastFailureTime = Date.now();
        
        if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
            this.circuitBreaker.state = 'OPEN';
        }
    }
}