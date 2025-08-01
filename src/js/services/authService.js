class AuthService {
    static authenticate(username, password) {
        // Demo credentials - in production, this would validate against a backend
        const validCredentials = {
            'user@table1837.com': 'password123',
            'admin@table1837.com': 'admin123',
            'staff@table1837.com': 'staff123'
        };
        
        return validCredentials[username] === password;
    }

    static isAuthenticated() {
        // Check if user is currently authenticated
        return sessionStorage.getItem('authenticated') === 'true';
    }

    static setAuthenticated(value) {
        sessionStorage.setItem('authenticated', value.toString());
    }

    static logout() {
        sessionStorage.removeItem('authenticated');
    }
}

export { AuthService }; 