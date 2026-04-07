// Database types and interfaces for the e-commerce system

export interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  address_id: number;
  customer_id: number;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: number;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  weight?: number;
  category_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  description?: string;
  parent_category_id?: number;
  created_at: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  order_date: string;
  status: string;
  total_amount: number;
  shipping_address_id: number;
  billing_address_id: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Review {
  review_id: number;
  product_id: number;
  customer_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  promotion_id: number;
  name: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  min_order_amount?: number;
  start_date: string;
  end_date: string;
  is_active: number;
  created_at: string;
}

export interface Warehouse {
  warehouse_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_active: number;
}

export interface Inventory {
  inventory_id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  reserved_quantity: number;
  last_restock_date?: string;
  updated_at: string;
}

export interface CustomerSegment {
  segment_id: number;
  name: string;
  description?: string;
  criteria: string;
  created_at: string;
}

export interface CustomerActivityLog {
  activity_id: number;
  customer_id: number;
  activity_type: string;
  activity_data?: string;
  created_at: string;
}

// Analytics and reporting types
export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    product_id: number;
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category_name: string;
    revenue: number;
    order_count: number;
  }>;
}

export interface CustomerLifetimeValue {
  customer_id: number;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  days_since_first_order: number;
  days_since_last_order: number;
  predicted_lifetime_value: number;
}

export interface ProductPerformance {
  product_id: number;
  name: string;
  total_sold: number;
  total_revenue: number;
  average_rating: number;
  review_count: number;
  current_inventory: number;
  reorder_point: number;
  days_since_last_sale: number;
  trend_direction: 'up' | 'down' | 'stable';
}

export interface SegmentMetrics {
  segment: string;
  customer_count: number;
  total_revenue: number;
  average_order_value: number;
  repeat_purchase_rate: number;
  churn_rate: number;
  lifetime_value: number;
}

// Error types
export interface DatabaseError extends Error {
  code?: string;
  errno?: number;
  sql?: string;
}

// Query result types
export type QueryResult<T> = Promise<T | null>;
export type QueryArrayResult<T> = Promise<T[]>;

// Database connection type
export type Database = any;
