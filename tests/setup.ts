// Jest setup file
// This file runs before each test file

// Set up test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set up global test utilities
(global as any).testUtils = {
  // Helper to create a test database
  createTestDatabase: () => {
    const Database = require('better-sqlite3');
    const { createSchema } = require('../src/schema');
    
    const db = new Database(':memory:');
    createSchema(db);
    return db;
  },
  
  // Helper to generate test data
  generateTestCustomer: (overrides = {}) => ({
    email: 'test@example.com',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    phone: '123-456-7890',
    status: 'active',
    ...overrides,
  }),
  
  generateTestProduct: (overrides = {}) => ({
    sku: 'TEST001',
    name: 'Test Product',
    description: 'A test product',
    category_id: 1,
    price: 99.99,
    cost: 50.00,
    weight: 1.5,
    is_active: 1,
    ...overrides,
  }),
  
  generateTestOrder: (overrides = {}) => ({
    order_number: 'ORD001',
    customer_id: 1,
    status: 'pending',
    subtotal: 100.00,
    tax_amount: 8.00,
    shipping_amount: 10.00,
    total_amount: 118.00,
    shipping_address_id: 1,
    billing_address_id: 1,
    ...overrides,
  }),
};
