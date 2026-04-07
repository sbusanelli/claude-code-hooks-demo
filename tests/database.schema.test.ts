import Database from 'better-sqlite3';
import { createSchema } from '../src/schema';

describe('Database Schema Validation Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    createSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('Table Structure Validation', () => {
    test('should have correct customers table structure', () => {
      const schema = db.prepare("PRAGMA table_info(customers)").all() as any[];
      const columns = schema.map(col => ({ name: col.name, type: col.type, notnull: col.notnull }));
      
      const expectedColumns = [
        { name: 'id', type: 'INTEGER', notnull: 1 },
        { name: 'email', type: 'TEXT', notnull: 1 },
        { name: 'username', type: 'TEXT', notnull: 0 },
        { name: 'first_name', type: 'TEXT', notnull: 1 },
        { name: 'last_name', type: 'TEXT', notnull: 1 },
        { name: 'phone', type: 'TEXT', notnull: 0 },
        { name: 'status', type: 'TEXT', notnull: 0 },
        { name: 'created_at', type: 'TIMESTAMP', notnull: 0 },
        { name: 'updated_at', type: 'TIMESTAMP', notnull: 0 }
      ];
      
      expect(columns).toHaveLength(9);
      
      expectedColumns.forEach(expected => {
        const actual = columns.find(col => col.name === expected.name);
        expect(actual).toBeDefined();
        expect(actual?.type).toBe(expected.type);
        expect(actual?.notnull).toBe(expected.notnull);
      });
    });

    test('should have correct products table structure', () => {
      const schema = db.prepare("PRAGMA table_info(products)").all() as any[];
      const columns = schema.map(col => ({ name: col.name, type: col.type, notnull: col.notnull }));
      
      const expectedColumns = [
        { name: 'id', type: 'INTEGER', notnull: 1 },
        { name: 'sku', type: 'TEXT', notnull: 1 },
        { name: 'name', type: 'TEXT', notnull: 1 },
        { name: 'description', type: 'TEXT', notnull: 0 },
        { name: 'category_id', type: 'INTEGER', notnull: 0 },
        { name: 'price', type: 'DECIMAL', notnull: 1 },
        { name: 'cost', type: 'DECIMAL', notnull: 0 },
        { name: 'weight', type: 'DECIMAL', notnull: 0 },
        { name: 'is_active', type: 'BOOLEAN', notnull: 0 },
        { name: 'created_at', type: 'TIMESTAMP', notnull: 0 },
        { name: 'updated_at', type: 'TIMESTAMP', notnull: 0 }
      ];
      
      expect(columns).toHaveLength(11);
      
      expectedColumns.forEach(expected => {
        const actual = columns.find(col => col.name === expected.name);
        expect(actual).toBeDefined();
        expect(actual?.type).toBe(expected.type);
        expect(actual?.notnull).toBe(expected.notnull);
      });
    });

    test('should have correct orders table structure', () => {
      const schema = db.prepare("PRAGMA table_info(orders)").all() as any[];
      const columns = schema.map(col => ({ name: col.name, type: col.type, notnull: col.notnull }));
      
      const expectedColumns = [
        { name: 'id', type: 'INTEGER', notnull: 1 },
        { name: 'order_number', type: 'TEXT', notnull: 1 },
        { name: 'customer_id', type: 'INTEGER', notnull: 1 },
        { name: 'status', type: 'TEXT', notnull: 0 },
        { name: 'subtotal', type: 'DECIMAL', notnull: 1 },
        { name: 'tax_amount', type: 'DECIMAL', notnull: 0 },
        { name: 'shipping_amount', type: 'DECIMAL', notnull: 0 },
        { name: 'total_amount', type: 'DECIMAL', notnull: 1 },
        { name: 'shipping_address_id', type: 'INTEGER', notnull: 0 },
        { name: 'billing_address_id', type: 'INTEGER', notnull: 0 },
        { name: 'created_at', type: 'TIMESTAMP', notnull: 0 },
        { name: 'shipped_at', type: 'TIMESTAMP', notnull: 0 },
        { name: 'delivered_at', type: 'TIMESTAMP', notnull: 0 }
      ];
      
      expect(columns).toHaveLength(13);
      
      expectedColumns.forEach(expected => {
        const actual = columns.find(col => col.name === expected.name);
        expect(actual).toBeDefined();
        expect(actual?.type).toBe(expected.type);
        expect(actual?.notnull).toBe(expected.notnull);
      });
    });

    test('should have correct addresses table structure', () => {
      const schema = db.prepare("PRAGMA table_info(addresses)").all() as any[];
      const columns = schema.map(col => ({ name: col.name, type: col.type, notnull: col.notnull }));
      
      const expectedColumns = [
        { name: 'id', type: 'INTEGER', notnull: 1 },
        { name: 'customer_id', type: 'INTEGER', notnull: 1 },
        { name: 'type', type: 'TEXT', notnull: 0 },
        { name: 'street_1', type: 'TEXT', notnull: 0 },
        { name: 'street_2', type: 'TEXT', notnull: 0 },
        { name: 'city', type: 'TEXT', notnull: 0 },
        { name: 'state', type: 'TEXT', notnull: 0 },
        { name: 'postal_code', type: 'TEXT', notnull: 0 },
        { name: 'country', type: 'TEXT', notnull: 0 },
        { name: 'is_default', type: 'INTEGER', notnull: 0 }
      ];
      
      expect(columns).toHaveLength(10);
      
      expectedColumns.forEach(expected => {
        const actual = columns.find(col => col.name === expected.name);
        expect(actual).toBeDefined();
        expect(actual?.type).toBe(expected.type);
        expect(actual?.notnull).toBe(expected.notnull);
      });
    });
  });

  describe('Foreign Key Constraints', () => {
    test('should enforce foreign key constraints', () => {
      // Enable foreign key constraints
      db.prepare("PRAGMA foreign_keys = ON").run();
      
      // Test orders.customer_id foreign key
      expect(() => {
        db.prepare("INSERT INTO orders (order_number, customer_id, status, subtotal, tax_amount, shipping_amount, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run('TEST001', 999, 'pending', 100.00, 8.00, 10.00, 118.00);
      }).toThrow(/FOREIGN KEY constraint failed/);
      
      // Test order_items.order_id foreign key
      expect(() => {
        db.prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)")
          .run(999, 999, 1, 50.00, 50.00);
      }).toThrow(/FOREIGN KEY constraint failed/);
    });

    test('should allow valid foreign key references', () => {
      // Enable foreign key constraints
      db.prepare("PRAGMA foreign_keys = ON").run();
      
      // Create valid references
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const customerId = customerStmt.run('fk@example.com', 'fkuser', 'FK', 'User', 'active').lastInsertRowid;
      
      const addressStmt = db.prepare(`
        INSERT INTO addresses (customer_id, type, street_1, city, state, postal_code, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const addressId = addressStmt.run(customerId, 'shipping', '123 FK St', 'FK City', 'FK', '12345', 'US', 1).lastInsertRowid;
      
      const orderStmt = db.prepare(`
        INSERT INTO orders (order_number, customer_id, status, subtotal, tax_amount, shipping_amount, total_amount, shipping_address_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const orderId = orderStmt.run('FK001', customerId, 'pending', 100.00, 8.00, 10.00, 118.00, addressId).lastInsertRowid;
      
      // Verify all records were created successfully
      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
      expect(order).toBeDefined();
      expect(order.customer_id).toBe(customerId);
      expect(order.shipping_address_id).toBe(addressId);
    });
  });

  describe('Check Constraints', () => {
    test('should enforce rating check constraint', () => {
      expect(() => {
        db.prepare("INSERT INTO reviews (product_id, customer_id, rating) VALUES (?, ?, ?)")
          .run(1, 1, 6); // Invalid rating > 5
      }).toThrow(/CHECK constraint failed/);
      
      expect(() => {
        db.prepare("INSERT INTO reviews (product_id, customer_id, rating) VALUES (?, ?, ?)")
          .run(1, 1, 0); // Invalid rating < 1
      }).toThrow(/CHECK constraint failed/);
      
      // Valid rating should work
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const customerId = customerStmt.run('rating@example.com', 'rating', 'Rating', 'User', 'active').lastInsertRowid;
      
      const productStmt = db.prepare(`
        INSERT INTO products (sku, name, price, is_active)
        VALUES (?, ?, ?, ?)
      `);
      const productId = productStmt.run('RATING001', 'Rating Test', 25.00, 1).lastInsertRowid;
      
      expect(() => {
        db.prepare("INSERT INTO reviews (product_id, customer_id, rating) VALUES (?, ?, ?)")
          .run(productId, customerId, 5); // Valid rating
      }).not.toThrow();
    });

    test('should enforce customer status check constraint', () => {
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      // Valid statuses
      expect(() => customerStmt.run('valid1@example.com', 'valid1', 'Valid', 'User', 'active')).not.toThrow();
      expect(() => customerStmt.run('valid2@example.com', 'valid2', 'Valid', 'User', 'inactive')).not.toThrow();
      expect(() => customerStmt.run('valid3@example.com', 'valid3', 'Valid', 'User', 'suspended')).not.toThrow();
      
      // Invalid status
      expect(() => customerStmt.run('invalid@example.com', 'invalid', 'Invalid', 'User', 'invalid_status'))
        .toThrow(/CHECK constraint failed/);
    });

    test('should enforce order status check constraint', () => {
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const customerId = customerStmt.run('order@example.com', 'order', 'Order', 'User', 'active').lastInsertRowid;
      
      const addressStmt = db.prepare(`
        INSERT INTO addresses (customer_id, type, street_1, city, state, postal_code, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const addressId = addressStmt.run(customerId, 'shipping', '123 Order St', 'Order City', 'OC', '12345', 'US', 1).lastInsertRowid;
      
      const orderStmt = db.prepare(`
        INSERT INTO orders (order_number, customer_id, status, subtotal, tax_amount, shipping_amount, total_amount, shipping_address_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Valid statuses
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
      validStatuses.forEach(status => {
        expect(() => orderStmt.run(`ORD_${status}`, customerId, status, 100.00, 8.00, 10.00, 118.00, addressId))
          .not.toThrow();
      });
      
      // Invalid status
      expect(() => orderStmt.run('ORD_INVALID', customerId, 'invalid_status', 100.00, 8.00, 10.00, 118.00, addressId))
        .toThrow(/CHECK constraint failed/);
    });
  });

  describe('Unique Constraints', () => {
    test('should enforce customer email uniqueness', () => {
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      customerStmt.run('unique@example.com', 'unique1', 'Unique', 'User1', 'active');
      
      expect(() => {
        customerStmt.run('unique@example.com', 'unique2', 'Unique', 'User2', 'active');
      }).toThrow(/UNIQUE constraint failed/);
    });

    test('should enforce product SKU uniqueness', () => {
      const productStmt = db.prepare(`
        INSERT INTO products (sku, name, price, is_active)
        VALUES (?, ?, ?, ?)
      `);
      
      productStmt.run('UNIQUE001', 'Product 1', 25.00, 1);
      
      expect(() => {
        productStmt.run('UNIQUE001', 'Product 2', 30.00, 1);
      }).toThrow(/UNIQUE constraint failed/);
    });

    test('should enforce order number uniqueness', () => {
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const customerId = customerStmt.run('order@example.com', 'order', 'Order', 'User', 'active').lastInsertRowid;
      
      const addressStmt = db.prepare(`
        INSERT INTO addresses (customer_id, type, street_1, city, state, postal_code, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const addressId = addressStmt.run(customerId, 'shipping', '123 Order St', 'Order City', 'OC', '12345', 'US', 1).lastInsertRowid;
      
      const orderStmt = db.prepare(`
        INSERT INTO orders (order_number, customer_id, status, subtotal, tax_amount, shipping_amount, total_amount, shipping_address_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      orderStmt.run('UNIQUE_ORD001', customerId, 'pending', 100.00, 8.00, 10.00, 118.00, addressId);
      
      expect(() => {
        orderStmt.run('UNIQUE_ORD001', customerId, 'pending', 200.00, 16.00, 20.00, 236.00, addressId);
      }).toThrow(/UNIQUE constraint failed/);
    });
  });

  describe('Default Values', () => {
    test('should set default values correctly', () => {
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name)
        VALUES (?, ?, ?, ?)
      `);
      const result = customerStmt.run('default@example.com', 'default', 'Default', 'User');
      
      const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(result.lastInsertRowid);
      expect(customer.status).toBeNull(); // No default for status
      expect(customer.created_at).toBeDefined();
      expect(customer.updated_at).toBeDefined();
    });

    test('should set boolean defaults correctly', () => {
      const productStmt = db.prepare(`
        INSERT INTO products (sku, name, price)
        VALUES (?, ?, ?)
      `);
      const result = productStmt.run('DEFAULT001', 'Default Product', 50.00);
      
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid);
      expect(product.is_active).toBe(1); // Default to true
    });

    test('should set numeric defaults correctly', () => {
      const inventoryStmt = db.prepare(`
        INSERT INTO inventory (product_id, warehouse_id, quantity)
        VALUES (?, ?, ?)
      `);
      const result = inventoryStmt.run(1, 1, 50);
      
      const inventory = db.prepare("SELECT * FROM inventory WHERE id = ?").get(result.lastInsertRowid);
      expect(inventory.reserved_quantity).toBe(0); // Default to 0
      expect(inventory.reorder_level).toBe(10); // Default to 10
    });
  });

  describe('Index Validation', () => {
    test('should have appropriate indexes', () => {
      const indexes = db.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL").all() as any[];
      
      // Check for foreign key indexes
      const indexNames = indexes.map(idx => idx.name);
      
      // Should have indexes on foreign keys for performance
      expect(indexNames.some(name => name.includes('customers'))).toBe(true);
      expect(indexNames.some(name => name.includes('products'))).toBe(true);
      expect(indexNames.some(name => name.includes('orders'))).toBe(true);
    });

    test('should enforce unique constraints through indexes', () => {
      const uniqueIndexes = db.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL AND sql LIKE '%UNIQUE%'").all() as any[];
      
      expect(uniqueIndexes.length).toBeGreaterThan(0);
      
      const indexNames = uniqueIndexes.map(idx => idx.name);
      expect(indexNames.some(name => name.includes('email'))).toBe(true);
      expect(indexNames.some(name => name.includes('sku'))).toBe(true);
      expect(indexNames.some(name => name.includes('order_number'))).toBe(true);
    });
  });
});
