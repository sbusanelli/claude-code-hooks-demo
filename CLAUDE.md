# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Claude Code hooks usage demo project that provides query functions for a SQLite database and demonstrates secret protection hooks. The project uses TypeScript.

## Database Schema

The SQLite database contains tables for a complete e-commerce system including:

- customers, addresses, customer_segments, customer_activity_log
- products, categories, inventory, warehouses
- orders, order_items
- reviews
- promotions

See `schema.ts` for the complete database schema definition.

## Project Structure

- `src/main.ts` - Entry point (currently minimal implementation)
- `src/schema.ts` - Database schema creation functions
- `src/queries/` - Directory containing all query modules:
  - `customer_queries.ts` - Customer-related queries
  - `product_queries.ts` - Product catalog queries
  - `order_queries.ts` - Order management queries
  - `analytics_queries.ts` - Analytics and reporting queries
  - `inventory_queries.ts` - Inventory management queries
  - `promotion_queries.ts` - Promotion queries
  - `review_queries.ts` - Product review queries
  - `shipping_queries.ts` - Shipping queries

## Development Commands

```bash
# Install dependencies
npm run setup
```

## Working with Queries

All query functions return Promises and follow these patterns:

- Single record queries use `db.get()`
- Multiple record queries use `db.all()`
- Use parameterized queries to prevent SQL injection
- Handle errors by rejecting the Promise

Example query pattern:

```typescript
export function getCustomerByEmail(db: Database, email: string): Promise<any> {
  const query = `SELECT * FROM customers WHERE email = ?`;
  return new Promise((resolve, reject) => {
    db.get(query, [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
```

## Critical Guidance

- Critical: All database queries must be written in the ./src/queries dir

## Security Hooks

This project implements PreTooluse hooks to prevent accidental exposure of sensitive information:

### **Secret File Protection**
- **Read Hook**: Blocks reading of secret files (`.env`, certificates, SSH keys, credentials)
- **Write Hook**: Prevents writing files containing API keys, passwords, or tokens
- **Content Detection**: Scans file content for secret patterns before allowing writes

### **Protected File Types**
- Environment files (`.env`, `.env.*`)
- Certificates and keys (`.key`, `.pem`, `.p12`, `.pfx`)
- Cloud provider credentials (`.aws/`, `.azure/`, `.gcp/`)
- SSH keys and database credentials
- Terraform state files and variables
- Files with "secret", "private", or "credentials" in name/path

### **Hook Configuration**
Hooks are configured in `.claude/settings.local.json` and automatically:
1. Intercept Read/Write operations before execution
2. Analyze file paths and content for secret patterns
3. Block operations with exit code 2 if secrets detected
4. Allow safe operations to proceed normally

### **Security Patterns**
The hooks detect common secret formats:
- API keys (OpenAI, GitHub, Slack tokens)
- Database connection strings
- Private key blocks (RSA, certificates)
- Password/secret assignments in code

This provides a robust security layer preventing accidental secret exposure while maintaining development workflow.
