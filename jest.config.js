module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/public/', '/views/'],
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'server.js',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
};
