// __tests__/setup.js

// Ensure environment is test
process.env.NODE_ENV = "test";

// Optional: silence console logs during tests (cleaner output)
const noop = () => {};
global.console = {
  ...console,
  log: noop,
  info: noop,
  warn: noop,
  error: console.error, // keep errors visible
};

// Extend Jest timeout (useful for integration tests hitting Express)
// jest.setTimeout(10000);

// Jest global hooks
beforeAll(async () => {
  // Runs once before all tests
  // e.g., connect to in-memory DB, seed test data
});

afterAll(async () => {
  // Runs once after all tests
  // e.g., close DB connections, cleanup
});

afterEach(async () => {
  // Runs after each test
  // e.g., reset mocks, clear timers
  jest.clearAllMocks();
});
