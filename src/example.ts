import Database from "better-sqlite3";

type DbType = any;

import { createSchema } from "./schema";
import * as customerQueries from "./queries/customer_queries";
import * as productQueries from "./queries/product_queries";
import * as orderQueries from "./queries/order_queries";
import * as analyticsQueries from "./queries/analytics_queries";

/**
 * Example usage of the e-commerce query system
 * This file demonstrates how to use various query functions
 */

function exampleUsage() {
  const db = new Database(process.env.DB_FILENAME || "ecommerce.db");

  try {
    console.log("🗄️  Creating database schema...");
    createSchema(db);
    console.log("✅ Database schema created successfully");

    // Insert sample data for demonstration
    insertSampleData(db);

    console.log("\n📊 Running example queries...");
    
    // Customer examples
    console.log("\n=== Customer Queries ===");
    const customer = customerQueries.getCustomerByEmail(db, "john.doe@example.com");
    console.log("👤 Customer by email:", customer?.first_name, customer?.last_name);

    const activeCustomers = customerQueries.fetchActiveCustomers(db, 30);
    console.log(`👥 Active customers (last 30 days): ${activeCustomers.length}`);

    // Product examples
    console.log("\n=== Product Queries ===");
    const electronics = productQueries.findProductsByCategory(db, 1);
    console.log(`🛍️  Electronics products: ${electronics.length}`);

    const lowStock =  productQueries.getLowStockProducts(db, 10);
    console.log(`⚠️  Low stock products: ${lowStock.length}`);

    // Order examples
    console.log("\n=== Order Queries ===");
    const completedOrders =  orderQueries.findOrdersByStatus(db, "completed");
    console.log(`📦 Completed orders: ${completedOrders.length}`);

    const recentOrders =  orderQueries.getRecentOrders(db, 7);
    console.log(`🕐 Recent orders (7 days): ${recentOrders.length}`);

    // Analytics examples
    console.log("\n=== Analytics Queries ===");
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    const salesByCategory =  analyticsQueries.getSalesByCategory(db, startDate, endDate);
    console.log(`📈 Sales by category (30 days): ${salesByCategory.length} categories`);
    
    salesByCategory.forEach(category => {
      console.log(`  ${category.category_name}: $${category.total_sales} (${category.order_item_count} orders)`);
    });

    const trendingProducts =  analyticsQueries.findTrendingProducts(db, 30);
    console.log(`🔥 Trending products (30 days): ${trendingProducts.length}`);

    console.log("\n✅ All examples completed successfully");

  } catch (error) {
    console.error("❌ Error in example usage:", error);
  } finally {
     db.close();
  }
}

async function insertSampleData(db: any) {
  console.log("📝 Inserting sample data...");
  
  // Insert sample categories
  await db.run(`
    INSERT OR IGNORE INTO categories (category_id, name, description) VALUES 
    (1, 'Electronics', 'Electronic devices and accessories'),
    (2, 'Books', 'Books and educational materials'),
    (3, 'Clothing', 'Apparel and fashion items')
  `);

  // Insert sample products
  await db.run(`
    INSERT OR IGNORE INTO products (product_id, name, sku, price, category_id, status) VALUES 
    (1, 'Laptop Pro', 'LAPTOP-001', 999.99, 1, 'active'),
    (2, 'Wireless Mouse', 'MOUSE-001', 29.99, 1, 'active'),
    (3, 'Programming Book', 'BOOK-001', 49.99, 2, 'active'),
    (4, 'T-Shirt', 'SHIRT-001', 19.99, 3, 'active')
  `);

  // Insert sample customers
  await db.run(`
    INSERT OR IGNORE INTO customers (customer_id, first_name, last_name, email, phone) VALUES 
    (1, 'John', 'Doe', 'john.doe@example.com', '555-0101'),
    (2, 'Jane', 'Smith', 'jane.smith@example.com', '555-0102'),
    (3, 'Bob', 'Johnson', 'bob.johnson@example.com', '555-0103')
  `);

  // Insert sample orders
  await db.run(`
    INSERT OR IGNORE INTO orders (order_id, customer_id, order_date, status, total_amount, shipping_address_id, billing_address_id) VALUES 
    (1, 1, '2024-01-15', 'completed', 1029.98, 1, 1),
    (2, 2, '2024-01-20', 'completed', 79.98, 2, 2),
    (3, 3, '2024-02-01', 'pending', 19.99, 3, 3)
  `);

  // Insert sample inventory
  await db.run(`
    INSERT OR IGNORE INTO inventory (inventory_id, product_id, warehouse_id, quantity, reserved_quantity) VALUES 
    (1, 1, 1, 50, 5),
    (2, 2, 1, 100, 10),
    (3, 3, 1, 25, 2),
    (4, 4, 1, 200, 15)
  `);

  console.log("✅ Sample data inserted");
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleUsage();
}

export { exampleUsage, insertSampleData };
