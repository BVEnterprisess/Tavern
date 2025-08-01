import { AuthService } from '../services/authService.js';

describe('AuthService', () => {
    beforeEach(() => {
        // Clear any stored authentication state
        sessionStorage.clear();
    });

    test('should authenticate valid credentials', () => {
        const result = AuthService.authenticate('user@table1837.com', 'password123');
        expect(result).toBe(true);
    });

    test('should reject invalid credentials', () => {
        const result = AuthService.authenticate('invalid@email.com', 'wrongpassword');
        expect(result).toBe(false);
    });

    test('should handle admin credentials', () => {
        const result = AuthService.authenticate('admin@table1837.com', 'admin123');
        expect(result).toBe(true);
    });

    test('should handle staff credentials', () => {
        const result = AuthService.authenticate('staff@table1837.com', 'staff123');
        expect(result).toBe(true);
    });

    test('should set and get authentication state', () => {
        AuthService.setAuthenticated(true);
        expect(AuthService.isAuthenticated()).toBe(true);
        
        AuthService.setAuthenticated(false);
        expect(AuthService.isAuthenticated()).toBe(false);
    });

    test('should clear authentication on logout', () => {
        AuthService.setAuthenticated(true);
        AuthService.logout();
        expect(AuthService.isAuthenticated()).toBe(false);
    });
}); 