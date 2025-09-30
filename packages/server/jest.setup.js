// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js)'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup.js'],
  setupFilesAfterEnv: ['<rootDir>/setup.js'], // it will be loaded but not matched as a test
};