module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/js/tests/setup.js'],
    testMatch: [
        '<rootDir>/src/js/tests/**/*.test.js',
        '<rootDir>/src/js/tests/**/*.spec.js'
    ],
    collectCoverageFrom: [
        'src/js/**/*.js',
        '!src/js/tests/**',
        '!src/js/tests/setup.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/js/$1'
    },
    testTimeout: 10000,
    verbose: true,
    clearMocks: true,
    restoreMocks: true
};