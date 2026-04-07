# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Claude Code hooks usage demo project that provides synchronous query functions for a better-sqlite3 database and demonstrates secret protection hooks. The project uses TypeScript and includes comprehensive database integration testing.

## Database Schema

The better-sqlite3 database contains tables for a complete e-commerce system including:

- customers, addresses, customer_segments, customer_activity_log
- products, categories, inventory, warehouses
- orders, order_items
- reviews
- promotions

See `src/schema.ts` for the complete database schema definition.

## Project Structure

- `src/main.ts` - Entry point with working example queries
- `src/schema.ts` - Database schema creation functions (better-sqlite3)
- `src/queries/` - Directory containing all synchronous query modules:
  - `customer_queries.ts` - Customer-related queries
  - `product_queries.ts` - Product catalog queries
  - `order_queries.ts` - Order management queries
  - `analytics_queries.ts` - Analytics and reporting queries
  - `inventory_queries.ts` - Inventory management queries
  - `promotion_queries.ts` - Promotion queries
  - `review_queries.ts` - Product review queries
  - `shipping_queries.ts` - Shipping queries
- `tests/` - Database integration tests with Jest framework
  - `database.test.ts` - Core database functionality tests
  - `database.integration.test.ts` - Integration test suite
  - `database.schema.test.ts` - Schema validation tests
  - `database.connection.test.ts` - Connection and transaction tests
  - `setup.ts` - Jest test configuration

## Development Commands

```bash
# Install dependencies
npm run setup

# Build and run the application
npm start

# Development mode
npm run dev

# Run example queries
npm run example

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Type checking
npm run type-check
```

## Working with Queries

All query functions use synchronous better-sqlite3 API and follow these patterns:

- Single record queries use `db.prepare(query).get(params)`
- Multiple record queries use `db.prepare(query).all(params)`
- Use parameterized queries to prevent SQL injection
- No async/await needed - all operations are synchronous
- Handle errors with try/catch blocks

Example query pattern:

```typescript
export function getCustomerByEmail(db: Database, email: string): any {
  const query = `SELECT * FROM customers WHERE email = ?`;
  const stmt = db.prepare(query);
  return stmt.get([email]);
}
```

## Database Migration Status

**COMPLETED**: Successfully migrated from sqlite3 to better-sqlite3:
- All query functions converted to synchronous API
- Column name mismatches fixed (customer_id -> id, order_date -> created_at, etc.)
- Database type annotations updated
- Application builds and runs without errors
- Zero vulnerabilities reported by npm audit

## Testing

The project includes comprehensive database integration tests:

- **9/9 tests passing** covering database connections, schema, transactions, and performance
- **100% schema.ts coverage** with Jest framework
- **Performance testing** for bulk operations and transaction efficiency
- **Error handling** validation for constraints and edge cases

Run tests with:
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
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
