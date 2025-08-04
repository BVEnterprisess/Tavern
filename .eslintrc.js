module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        'no-console': 'warn',
        'no-unused-vars': 'warn',
        'no-undef': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'eqeqeq': 'error',
        'curly': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
        'no-unsafe-finally': 'error',
        'no-unsafe-negation': 'error',
        'require-await': 'warn',
        'valid-typeof': 'error'
    },
    globals: {
        'adminTools': 'readonly',
        'window': 'readonly',
        'document': 'readonly',
        'localStorage': 'readonly',
        'sessionStorage': 'readonly',
        'performance': 'readonly',
        'navigator': 'readonly',
        'location': 'readonly',
        'fetch': 'readonly',
        'caches': 'readonly',
        'serviceWorker': 'readonly'
    }
};