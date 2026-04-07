import Database from "better-sqlite3";

type DbType = any;

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
  const db = new Database(process.env.DB_FILENAME || "ecommerce.db") as DbType;

  console.log(" Creating database schema...");
  console.log("Database methods:", Object.getOwnPropertyNames(db.__proto__).filter(name => typeof db[name] === 'function'));
  createSchema(db);
  console.log(" Database schema created successfully");

  // Example usage of query functions
  console.log("\n Running example queries...");
  
  try {
    // Customer queries example
    const customer = customerQueries.getCustomerByEmail(db, "test@example.com");
    console.log(` Found customer: ${customer ? customer.first_name : 'None'}`);

    // Product queries example
    const products = productQueries.findProductsByCategory(db, 1);
    console.log(` Found ${products.length} products in electronics category`);

    // Order queries example
    const recentOrders = orderQueries.findOrdersByStatus(db, "completed");
    console.log(` Found ${recentOrders.length} recent orders`);

    // Analytics queries example
    const analytics = analyticsQueries.calculateCustomerLifetimeValue(db, 1);
    console.log(` Analytics: Customer lifetime value calculated`);

    // Inventory queries example
    const inventory = inventoryQueries.getWarehouseInventory(db, 1);
    console.log(` Low stock items: ${inventory.length}`);

    // Promotion queries example
    const activePromotions = promotionQueries.getActivePromotions(db);
    console.log(` Active promotions: ${activePromotions.length}`);

    // Review queries example
    const topReviews = reviewQueries.getProductReviews(db, 1);
    console.log(` Top rated products: ${topReviews.length}`);

    // Shipping queries example
    const shippingStatus = shippingQueries.getShippingAddresses(db, 1);
    console.log(` Shipping addresses: ${shippingStatus.length}`);

  } catch (error: any) {
    console.error(" Error running example queries:", error);
  } finally {
    // Close database connection
    db.close();
    console.log("\n Example completed successfully!");
    console.log("\n🎯 Example completed successfully!");
  }
}

main().catch((error) => {
  console.error("❌ Application error:", error);
  process.exit(1);
});
