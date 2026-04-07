import Database from 'better-sqlite3';
import { createSchema } from '../src/schema';
import * as customerQueries from '../src/queries/customer_queries';
import * as productQueries from '../src/queries/product_queries';
import * as orderQueries from '../src/queries/order_queries';
import * as inventoryQueries from '../src/queries/inventory_queries';
import * as analyticsQueries from '../src/queries/analytics_queries';
import * as promotionQueries from '../src/queries/promotion_queries';
import * as reviewQueries from '../src/queries/review_queries';
import * as shippingQueries from '../src/queries/shipping_queries';

describe('Database Integration Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    // Create a fresh in-memory database for each test
    db = new Database(':memory:');
    createSchema(db);
  });

  afterEach(() => {
    // Close the database connection after each test
    db.close();
  });

  describe('Database Connection and Schema', () => {
    test('should create database connection successfully', () => {
      expect(db).toBeDefined();
      expect(db.open).toBe(true);
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

    test('should verify table schemas', () => {
      // Check customers table
      const customersSchema = db.prepare("PRAGMA table_info(customers)").all() as any[];
      expect(customersSchema).toHaveLength(9); // id, email, username, first_name, last_name, phone, status, created_at, updated_at
      
      // Check products table
      const productsSchema = db.prepare("PRAGMA table_info(products)").all() as any[];
      expect(productsSchema).toHaveLength(11); // id, sku, name, description, category_id, price, cost, weight, is_active, created_at, updated_at
      
      // Check orders table
      const ordersSchema = db.prepare("PRAGMA table_info(orders)").all() as any[];
      expect(ordersSchema).toHaveLength(13); // id, order_number, customer_id, status, subtotal, tax_amount, shipping_amount, total_amount, shipping_address_id, billing_address_id, created_at, shipped_at, delivered_at
    });
  });

  describe('Customer Queries', () => {
    test('should create and retrieve customer', () => {
      // Insert test customer
      const insertStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, phone, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = insertStmt.run('test@example.com', 'testuser', 'Test', 'User', '123-456-7890', 'active');
      
      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeDefined();
      
      // Test customer query
      const customer = customerQueries.getCustomerByEmail(db, 'test@example.com');
      expect(customer).toBeDefined();
      expect(customer.email).toBe('test@example.com');
      expect(customer.first_name).toBe('Test');
      expect(customer.last_name).toBe('User');
    });

    test('should handle non-existent customer gracefully', () => {
      const customer = customerQueries.getCustomerByEmail(db, 'nonexistent@example.com');
      expect(customer).toBeUndefined();
    });

    test('should fetch active customers', () => {
      // Insert test customers
      const insertStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run('active1@example.com', 'active1', 'Active', 'User1', 'active');
      insertStmt.run('active2@example.com', 'active2', 'Active', 'User2', 'active');
      insertStmt.run('inactive@example.com', 'inactive', 'Inactive', 'User', 'inactive');
      
      const activeCustomers = customerQueries.fetchActiveCustomers(db);
      expect(activeCustomers).toHaveLength(2);
    });
  });

  describe('Product Queries', () => {
    beforeEach(() => {
      // Setup test data
      const categoryStmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
      const categoryId = categoryStmt.run('Electronics').lastInsertRowid;
      
      const productStmt = db.prepare(`
        INSERT INTO products (sku, name, description, category_id, price, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      productStmt.run('TEST001', 'Test Product', 'A test product', categoryId, 99.99, 1);
    });

    test('should find products by category', () => {
      const products = productQueries.findProductsByCategory(db, 1);
      expect(products).toHaveLength(1);
      expect(products[0].sku).toBe('TEST001');
      expect(products[0].name).toBe('Test Product');
    });

    test('should get product details', () => {
      const product = productQueries.getProductDetails(db, 1);
      expect(product).toBeDefined();
      expect(product.sku).toBe('TEST001');
      expect(product.name).toBe('Test Product');
    });

    test('should fetch product by SKU', () => {
      const product = productQueries.fetchProductBySku(db, 'TEST001');
      expect(product).toBeDefined();
      expect(product.sku).toBe('TEST001');
    });
  });

  describe('Order Queries', () => {
    beforeEach(() => {
      // Setup test data
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const customerId = customerStmt.run('order@example.com', 'orderuser', 'Order', 'User', 'active').lastInsertRowid;
      
      const addressStmt = db.prepare(`
        INSERT INTO addresses (customer_id, type, street_1, city, state, postal_code, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const addressId = addressStmt.run(customerId, 'shipping', '123 Test St', 'Test City', 'TS', '12345', 'US', 1).lastInsertRowid;
      
      const orderStmt = db.prepare(`
        INSERT INTO orders (order_number, customer_id, status, subtotal, tax_amount, shipping_amount, total_amount, shipping_address_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      orderStmt.run('ORD001', customerId, 'pending', 100.00, 8.00, 10.00, 118.00, addressId);
    });

    test('should get order details', () => {
      const order = orderQueries.getOrderDetails(db, 1);
      expect(order).toBeDefined();
      expect(order.order_number).toBe('ORD001');
      expect(order.status).toBe('pending');
    });

    test('should find orders by status', () => {
      const orders = orderQueries.findOrdersByStatus(db, 'pending');
      expect(orders).toHaveLength(1);
      expect(orders[0].status).toBe('pending');
    });

    test('should get recent orders', () => {
      const orders = orderQueries.getRecentOrders(db, 7);
      expect(orders).toHaveLength(1);
    });
  });

  describe('Inventory Queries', () => {
    beforeEach(() => {
      // Setup test data
      const categoryStmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
      const categoryId = categoryStmt.run('Electronics').lastInsertRowid;
      
      const productStmt = db.prepare(`
        INSERT INTO products (sku, name, category_id, price, is_active)
        VALUES (?, ?, ?, ?, ?)
      `);
      const productId = productStmt.run('INV001', 'Inventory Test', categoryId, 50.00, 1).lastInsertRowid;
      
      const warehouseStmt = db.prepare("INSERT INTO warehouses (name, city, state, country) VALUES (?, ?, ?, ?)");
      const warehouseId = warehouseStmt.run('Main Warehouse', 'Warehouse City', 'WC', 'US').lastInsertRowid;
      
      const inventoryStmt = db.prepare(`
        INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity, reorder_level)
        VALUES (?, ?, ?, ?, ?)
      `);
      inventoryStmt.run(productId, warehouseId, 100, 10, 20);
    });

    test('should get warehouse inventory', () => {
      const inventory = inventoryQueries.getWarehouseInventory(db, 1);
      expect(inventory).toHaveLength(1);
      expect(inventory[0].sku).toBe('INV001');
      expect(inventory[0].total_quantity).toBe(100);
    });

    test('should check product availability', () => {
      const availability = inventoryQueries.checkProductAvailability(db, 1);
      expect(availability).toHaveLength(1);
      expect(availability[0].available_quantity).toBe(90); // 100 - 10 reserved
    });

    test('should find low stock products', () => {
      // Update inventory to be low stock
      const updateStmt = db.prepare("UPDATE inventory SET quantity = 15 WHERE product_id = 1");
      updateStmt.run();
      
      const lowStock = inventoryQueries.getLowStockProducts(db, 20);
      expect(lowStock).toHaveLength(1);
      expect(lowStock[0].total_quantity).toBe(15);
    });
  });

  describe('Analytics Queries', () => {
    test('should calculate customer lifetime value', () => {
      // Setup test customer
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const customerId = customerStmt.run('analytics@example.com', 'analytics', 'Analytics', 'User', 'active').lastInsertRowid;
      
      const ltv = analyticsQueries.calculateCustomerLifetimeValue(db, customerId);
      expect(ltv).toBeDefined();
      expect(ltv.customer_id).toBe(customerId);
      expect(ltv.order_count).toBe(0); // No orders yet
      expect(ltv.total_spent).toBe(0);
    });

    test('should get product performance', () => {
      // Setup test product
      const categoryStmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
      const categoryId = categoryStmt.run('Electronics').lastInsertRowid;
      
      const productStmt = db.prepare(`
        INSERT INTO products (sku, name, category_id, price, is_active)
        VALUES (?, ?, ?, ?, ?)
      `);
      const productId = productStmt.run('PERF001', 'Performance Test', categoryId, 75.00, 1).lastInsertRowid;
      
      const performance = analyticsQueries.getProductPerformance(db);
      expect(performance).toBeDefined();
      expect(Array.isArray(performance)).toBe(true);
    });
  });

  describe('Promotion Queries', () => {
    test('should get active promotions', () => {
      // Setup test promotion
      const promoStmt = db.prepare(`
        INSERT INTO promotions (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, usage_count, start_date, end_date, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      promoStmt.run('TEST10', 'Test 10% off', 'percentage', 10.00, 50.00, 100, 0, '2024-01-01', '2024-12-31', 1);
      
      const promotions = promotionQueries.getActivePromotions(db);
      expect(promotions).toBeDefined();
      expect(Array.isArray(promotions)).toBe(true);
    });
  });

  describe('Review Queries', () => {
    test('should get product reviews', () => {
      // Setup test data
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const customerId = customerStmt.run('reviewer@example.com', 'reviewer', 'Reviewer', 'User', 'active').lastInsertRowid;
      
      const categoryStmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
      const categoryId = categoryStmt.run('Electronics').lastInsertRowid;
      
      const productStmt = db.prepare(`
        INSERT INTO products (sku, name, category_id, price, is_active)
        VALUES (?, ?, ?, ?, ?)
      `);
      const productId = productStmt.run('REV001', 'Review Test', categoryId, 25.00, 1).lastInsertRowid;
      
      const reviewStmt = db.prepare(`
        INSERT INTO reviews (product_id, customer_id, rating, title, comment)
        VALUES (?, ?, ?, ?, ?)
      `);
      reviewStmt.run(productId, customerId, 5, 'Great Product', 'This is a great product!');
      
      const reviews = reviewQueries.getProductReviews(db, productId);
      expect(reviews).toHaveLength(1);
      expect(reviews[0].rating).toBe(5);
      expect(reviews[0].comment).toBe('This is a great product!');
    });
  });

  describe('Shipping Queries', () => {
    test('should get shipping addresses', () => {
      // Setup test customer and address
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const customerId = customerStmt.run('shipper@example.com', 'shipper', 'Shipper', 'User', 'active').lastInsertRowid;
      
      const addressStmt = db.prepare(`
        INSERT INTO addresses (customer_id, type, street_1, city, state, postal_code, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      addressStmt.run(customerId, 'shipping', '456 Ship St', 'Ship City', 'SC', '67890', 'US', 1);
      
      const addresses = shippingQueries.getShippingAddresses(db, customerId);
      expect(addresses).toHaveLength(1);
      expect(addresses[0].street_1).toBe('456 Ship St');
      expect(addresses[0].city).toBe('Ship City');
    });
  });

  describe('Database Transactions', () => {
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
      const customer = customerQueries.getCustomerByEmail(db, 'trans@example.com');
      expect(customer).toBeDefined();
      expect(customer.id).toBe(customerId);
      
      const addresses = shippingQueries.getShippingAddresses(db, customerId);
      expect(addresses).toHaveLength(1);
    });

    test('should rollback on transaction failure', () => {
      expect(() => {
        const failingTransaction = db.transaction(() => {
          // Insert customer
          const customerStmt = db.prepare(`
            INSERT INTO customers (email, username, first_name, last_name, status)
            VALUES (?, ?, ?, ?, ?)
          `);
          customerStmt.run('fail@example.com', 'fail', 'Fail', 'User', 'active');
          
          // This should fail due to foreign key constraint
          const orderStmt = db.prepare(`
            INSERT INTO orders (order_number, customer_id, status, subtotal, tax_amount, shipping_amount, total_amount, shipping_address_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          orderStmt.run('FAIL001', 999, 'pending', 100.00, 8.00, 10.00, 118.00, 999);
        });
        
        failingTransaction();
      }).toThrow();
      
      // Verify customer was not inserted due to rollback
      const customer = customerQueries.getCustomerByEmail(db, 'fail@example.com');
      expect(customer).toBeUndefined();
    });
  });

  describe('Database Performance', () => {
    test('should handle multiple concurrent operations', () => {
      const insertStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      // Insert 100 customers
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        insertStmt.run(`perf${i}@example.com`, `perf${i}`, 'Perf', 'User', 'active');
      }
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      
      // Verify all customers were inserted
      const activeCustomers = customerQueries.fetchActiveCustomers(db);
      expect(activeCustomers).toHaveLength(100);
    });

    test('should handle complex joins efficiently', () => {
      // Setup comprehensive test data
      const categoryStmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
      const categoryId = categoryStmt.run('Test Category').lastInsertRowid;
      
      const productStmt = db.prepare(`
        INSERT INTO products (sku, name, category_id, price, is_active)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const customerStmt = db.prepare(`
        INSERT INTO customers (email, username, first_name, last_name, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      // Create 10 products and 10 customers
      for (let i = 0; i < 10; i++) {
        productStmt.run(`PERF${i}`, `Performance Test ${i}`, categoryId, 50.00 + i, 1);
        customerStmt.run(`perf${i}@example.com`, `perf${i}`, 'Perf', 'User', 'active');
      }
      
      // Test complex query performance
      const startTime = Date.now();
      const performance = analyticsQueries.getProductPerformance(db);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
      expect(Array.isArray(performance)).toBe(true);
    });
  });
});
