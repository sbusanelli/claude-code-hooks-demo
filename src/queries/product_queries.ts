import Database from "better-sqlite3";

type DbType = any;

interface ProductDetails {
  product_id: number;
  name: string;
  sku: string;
  price: number;
  status: string;
  category_name: string;
  total_inventory: number;
  average_rating: number;
}

interface ProductByCategory {
  product_id: number;
  name: string;
  price: number;
  total_quantity_sold: number;
  days_since_last_ordered: number | null;
}

interface LowStockProduct {
  product_id: number;
  name: string;
  sku: string;
  category_name: string;
  total_quantity: number;
  last_restock_date: string | null;
  pending_order_count: number;
}

interface ProductBySku {
  product_id: number;
  name: string;
  sku: string;
  price: number;
  warehouse_quantities: string;
  active_review_count: number;
  orders_last_30_days: number;
}

interface AvailableProduct {
  product_id: number;
  name: string;
  sku: string;
  category_path: string;
  weight: number;
  total_inventory: number;
  reserved_quantities: number;
}

interface ProductNeedingReorder {
  product_id: number;
  name: string;
  sku: string;
  reorder_level: number;
  current_stock: number;
  vendor_info: string;
  daily_sales_velocity: number;
}

interface ProductSearchResult {
  product_id: number;
  name: string;
  status: string;
  total_revenue: number;
  inventory_status: string;
}

export function getProductDetails(
  db: DbType,
  productId: number
) {
  const query = `
    SELECT 
        p.product_id,
        p.name,
        p.sku,
        p.price,
        p.status,
        c.name as category_name,
        COALESCE(SUM(i.quantity), 0) as total_inventory,
        COALESCE(AVG(r.rating), 0) as average_rating
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.product_id = i.product_id
    LEFT JOIN reviews r ON p.product_id = r.product_id
    WHERE p.product_id = ?
    GROUP BY p.product_id, p.name, p.sku, p.price, p.status, c.name
  `;

  const result =  db.prepare().get(query, [productId]);
  return result as ProductDetails | null;
}

export function findProductsByCategory(
  db: DbType,
  categoryId: number
) {
  const query = `
    SELECT 
        p.product_id,
        p.name,
        p.price,
        COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
        JULIANDAY('now') - JULIANDAY(MAX(o.created_at)) as days_since_last_ordered
    FROM products p
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.order_id
    WHERE p.category_id = ?
    GROUP BY p.product_id, p.name, p.price
  `;

  const results =  db.all(query, [categoryId]);
  return results as ProductByCategory[];
}

export function getLowStockProducts(
  db: DbType,
  threshold: number = 20
) {
  const query = `
    SELECT 
        p.product_id,
        p.name,
        p.sku,
        c.name as category_name,
        COALESCE(SUM(i.quantity), 0) as total_quantity,
        i.last_updated as last_restock_date,
        COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN oi.order_id END) as pending_order_count
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.product_id = i.product_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.order_id
    GROUP BY p.product_id, p.name, p.sku, c.name, i.last_updated
    HAVING COALESCE(SUM(i.quantity), 0) < ?
  `;

  const results =  db.all(query, [threshold]);
  return results as LowStockProduct[];
}

export function fetchProductBySku(
  db: DbType,
  sku: string
) {
  const query = `
    SELECT 
        p.product_id,
        p.name,
        p.sku,
        p.price,
        GROUP_CONCAT(w.city || ':' || COALESCE(i.quantity, 0)) as warehouse_quantities,
        COUNT(DISTINCT r.review_id) as active_review_count,
        COUNT(DISTINCT CASE 
            WHEN o.created_at >= datetime('now', '-30 days') 
            THEN oi.order_id 
        END) as orders_last_30_days
    FROM products p
    LEFT JOIN inventory i ON p.product_id = i.product_id
    LEFT JOIN warehouses w ON i.warehouse_id = w.warehouse_id
    LEFT JOIN reviews r ON p.product_id = r.product_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.order_id
    WHERE p.sku = ?
    GROUP BY p.product_id, p.name, p.sku, p.price
  `;

  const result =  db.prepare().get(query, [sku]);
  return result as ProductBySku | null;
}

export function listAvailableProducts(
  db: DbType
) {
  const query = `
    SELECT 
        p.product_id,
        p.name,
        p.sku,
        c.name as category_path,
        p.weight,
        COALESCE(SUM(i.quantity), 0) as total_inventory,
        COALESCE(SUM(i.reserved_quantity), 0) as reserved_quantities
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.product_id = i.product_id
    WHERE p.status = 'active'
    GROUP BY p.product_id, p.name, p.sku, c.name, p.weight
    HAVING COALESCE(SUM(i.quantity), 0) > 0
  `;

  const results =  db.all(query, []);
  return results as AvailableProduct[];
}

export function getProductsNeedingReorder(
  db: DbType
) {
  const query = `
    SELECT 
        p.product_id,
        p.name,
        p.sku,
        p.reorder_level,
        COALESCE(SUM(i.quantity), 0) as current_stock,
        p.description as vendor_info,
        COALESCE(SUM(CASE 
            WHEN o.created_at >= datetime('now', '-30 days') 
            THEN oi.quantity 
        END), 0) / 30.0 as daily_sales_velocity
    FROM products p
    LEFT JOIN inventory i ON p.product_id = i.product_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.order_id
    GROUP BY p.product_id, p.name, p.sku, p.reorder_level, p.description
    HAVING COALESCE(SUM(i.quantity), 0) < p.reorder_level
  `;

  const results =  db.all(query, []);
  return results as ProductNeedingReorder[];
}

export function searchProductsByName(
  db: DbType,
  searchTerm: string
) {
  const query = `
    SELECT 
        p.product_id,
        p.name,
        p.status,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
        CASE 
            WHEN COALESCE(SUM(i.quantity), 0) = 0 THEN 'out_of_stock'
            WHEN COALESCE(SUM(i.quantity), 0) < p.reorder_level THEN 'low_stock'
            ELSE 'in_stock'
        END as inventory_status
    FROM products p
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN inventory i ON p.product_id = i.product_id
    WHERE p.name LIKE '%' || ? || '%'
    GROUP BY p.product_id, p.name, p.status, p.reorder_level
  `;

  const results =  db.all(query, [searchTerm]);
  return results as ProductSearchResult[];
}
