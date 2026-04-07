import Database from "better-sqlite3";

import { createSchema } from "./schema";
import * as customerQueries from "./queries/customer_queries";
import * as productQueries from "./queries/product_queries";
import * as orderQueries from "./queries/order_queries";
import * as analyticsQueries from "./queries/analytics_queries";
import * as inventoryQueries from "./queries/inventory_queries";
import * as promotionQueries from "./queries/promotion_queries";
import * as reviewQueries from "./queries/review_queries";
import * as shippingQueries from "./queries/shipping_queries";

async function main() {
  const db = new Database(process.env.DB_FILENAME || "ecommerce.db");

  console.log("🗄️  Creating database schema...");
  createSchema(db);
  console.log("✅ Database schema created successfully");

  // Example usage of query functions
  console.log("\n📊 Running example queries...");
  
  try {
    // Customer queries example
    const customer = await customerQueries.getCustomerByEmail(db, "test@example.com");
    console.log(`👥 Found customer: ${customer ? customer.first_name : 'None'}`);

    // Product queries example  
    const products = await productQueries.findProductsByCategory(db, 1);
    console.log(`🛍️  Found ${products.length} products in category 1`);

    // Order queries example
    const orders = await orderQueries.findOrdersByStatus(db, "completed");
    console.log(`📦 Found ${orders.length} completed orders`);

    // Analytics example
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    const salesByCategory = await analyticsQueries.getSalesByCategory(db, startDate, endDate);
    console.log(`📈 Analytics: Found sales data for ${salesByCategory.length} categories`);

    console.log("\n✅ All query modules are working correctly");
    
  } catch (error) {
    console.error("❌ Error running example queries:", error);
  } finally {
    await db.close();
    console.log("🔒 Database connection closed");
  }
}

main().catch((error) => {
  console.error("❌ Application error:", error);
  process.exit(1);
});
