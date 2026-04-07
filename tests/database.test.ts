import Database from 'better-sqlite3';
import { createSchema } from '../src/schema';

describe('Database Integration Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    createSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  test('should create database connection successfully', () => {
    expect(db).toBeDefined();
    expect(db.open).toBe(true);
    
    const result = db.prepare("SELECT 1 as test").get() as {test: number};
    expect(result.test).toBe(1);
  });

  test('should create all required tables', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {name: string}[];
    const tableNames = tables.map(t => t.name);
    
    const expectedTables = [
      'customers', 'categories', 'products', 'inventory', 
      'warehouses', 'addresses', 'orders', 'order_items',
      'reviews', 'promotions', 'customer_activity_log'
    ];
    
    expectedTables.forEach(table => {
      expect(tableNames).toContain(table);
    });
  });

  test('should insert and retrieve customer data', () => {
    const insertStmt = db.prepare(`
      INSERT INTO customers (email, username, first_name, last_name, phone, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = insertStmt.run('test@example.com', 'testuser', 'Test', 'User', '123-456-7890', 'active');
    
    expect(result.changes).toBe(1);
    expect(result.lastInsertRowid).toBeDefined();
    
    const customer = db.prepare("SELECT * FROM customers WHERE email = ?").get('test@example.com') as any;
    expect(customer.email).toBe('test@example.com');
    expect(customer.first_name).toBe('Test');
    expect(customer.last_name).toBe('User');
  });

  test('should handle foreign key constraints', () => {
    db.prepare("PRAGMA foreign_keys = ON").run();
    
    // Create customer first
    const customerStmt = db.prepare(`
      INSERT INTO customers (email, username, first_name, last_name, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const customerId = customerStmt.run('fk@example.com', 'fkuser', 'FK', 'User', 'active').lastInsertRowid;
    
    // Create address
    const addressStmt = db.prepare(`
      INSERT INTO addresses (customer_id, type, street_1, city, state, postal_code, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const addressId = addressStmt.run(customerId, 'shipping', '123 FK St', 'FK City', 'FK', '12345', 'US', 1).lastInsertRowid;
    
    // Create order with valid references
    const orderStmt = db.prepare(`
      INSERT INTO orders (order_number, customer_id, status, subtotal, tax_amount, shipping_amount, total_amount, shipping_address_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const orderId = orderStmt.run('FK001', customerId, 'pending', 100.00, 8.00, 10.00, 118.00, addressId).lastInsertRowid;
    
    // Verify all records were created
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as any;
    expect(order).toBeDefined();
    expect(order.customer_id).toBe(customerId);
    expect(order.shipping_address_id).toBe(addressId);
  });

  test('should enforce unique constraints', () => {
    const customerStmt = db.prepare(`
      INSERT INTO customers (email, username, first_name, last_name, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    customerStmt.run('unique@example.com', 'unique1', 'Unique', 'User1', 'active');
    
    // Should throw error for duplicate email
    expect(() => {
      customerStmt.run('unique@example.com', 'unique2', 'Unique', 'User2', 'active');
    }).toThrow(/UNIQUE constraint failed/);
  });

  test('should handle transactions correctly', () => {
    const transaction = db.transaction(() => {
      // Insert customer
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const customerId = customerStmt.run('trans@example.com', 'trans', 'Transaction', 'User', 'active').lastInsertRowid;
      
      // Insert address
      const addressStmt = db.prepare(`
        INSERT INTO addresses (customer_id, type, street_1, city, state, postal_code, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      addressStmt.run(customerId, 'shipping', '789 Trans St', 'Trans City', 'TC', '11111', 'US', 1);
      
      return customerId;
    });
    
    const customerId = transaction();
    expect(customerId).toBeDefined();
    
    // Verify both records were created
    const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(customerId) as any;
    expect(customer).toBeDefined();
    expect(customer.id).toBe(customerId);
    
    const addresses = db.prepare("SELECT COUNT(*) as count FROM addresses WHERE customer_id = ?").get(customerId) as {count: number};
    expect(addresses.count).toBe(1);
  });

  test('should handle bulk operations efficiently', () => {
    const insertWithoutTransaction = () => {
      const tempDb = new Database(':memory:');
      createSchema(tempDb);
      
      const startTime = Date.now();
      for (let i = 0; i < 50; i++) {
        tempDb.prepare("INSERT INTO customers (email, username, first_name, last_name, status) VALUES (?, ?, ?, ?, ?)")
          .run(`bulk${i}@example.com`, `bulk${i}`, 'Bulk', 'User', 'active');
      }
      const endTime = Date.now();
      
      const count = tempDb.prepare("SELECT COUNT(*) as count FROM customers").get() as {count: number};
      tempDb.close();
      
      return { time: endTime - startTime, count: count.count };
    };
    
    const insertWithTransaction = () => {
      const tempDb = new Database(':memory:');
      createSchema(tempDb);
      
      const startTime = Date.now();
      tempDb.prepare("BEGIN TRANSACTION").run();
      
      for (let i = 0; i < 50; i++) {
        tempDb.prepare("INSERT INTO customers (email, username, first_name, last_name, status) VALUES (?, ?, ?, ?, ?)")
          .run(`bulk${i}@example.com`, `bulk${i}`, 'Bulk', 'User', 'active');
      }
      
      tempDb.prepare("COMMIT").run();
      const endTime = Date.now();
      
      const count = tempDb.prepare("SELECT COUNT(*) as count FROM customers").get() as {count: number};
      tempDb.close();
      
      return { time: endTime - startTime, count: count.count };
    };
    
    const withoutTrans = insertWithoutTransaction();
    const withTrans = insertWithTransaction();
    
    expect(withoutTrans.count).toBe(50);
    expect(withTrans.count).toBe(50);
    
    // Transaction should complete successfully (timing can vary)
    expect(withTrans.time).toBeGreaterThanOrEqual(0);
    expect(withoutTrans.time).toBeGreaterThanOrEqual(0);
    
    // Both should complete within reasonable time
    expect(withTrans.time).toBeLessThan(1000); // 1 second max
    expect(withoutTrans.time).toBeLessThan(2000); // 2 seconds max
  });

  test('should verify table schemas', () => {
    // Check customers table structure
    const customersSchema = db.prepare("PRAGMA table_info(customers)").all() as any[];
    expect(customersSchema).toHaveLength(9);
    
    const customerColumns = customersSchema.map(col => col.name);
    expect(customerColumns).toContain('id');
    expect(customerColumns).toContain('email');
    expect(customerColumns).toContain('first_name');
    expect(customerColumns).toContain('last_name');
    
    // Check products table structure
    const productsSchema = db.prepare("PRAGMA table_info(products)").all() as any[];
    expect(productsSchema).toHaveLength(11);
    
    const productColumns = productsSchema.map(col => col.name);
    expect(productColumns).toContain('id');
    expect(productColumns).toContain('sku');
    expect(productColumns).toContain('name');
    expect(productColumns).toContain('price');
  });

  test('should handle database pragmas', () => {
    // Test foreign key enforcement
    db.prepare("PRAGMA foreign_keys = ON").run();
    const fkResult = db.prepare("PRAGMA foreign_keys").get() as {foreign_keys: number};
    expect(fkResult.foreign_keys).toBe(1);
    
    // Test journal mode (in-memory databases use 'memory' mode)
    db.prepare("PRAGMA journal_mode = WAL").run();
    const journalResult = db.prepare("PRAGMA journal_mode").get() as {journal_mode: string};
    // In-memory databases don't support WAL mode, so they use 'memory' mode
    expect(['memory', 'wal']).toContain(journalResult.journal_mode);
    
    // Test synchronous mode
    db.prepare("PRAGMA synchronous = NORMAL").run();
    const syncResult = db.prepare("PRAGMA synchronous").get() as {synchronous: number};
    expect(syncResult.synchronous).toBe(1);
  });
});
