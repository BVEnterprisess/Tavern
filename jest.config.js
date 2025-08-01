module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/js/tests/setup.js'],
    moduleNameMapping: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    collectCoverageFrom: [
        'src/js/**/*.js',
        '!src/js/tests/**',
        '!src/js/**/*.test.js'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    }
}; 