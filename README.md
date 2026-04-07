# Claude Code Hooks Usage Demo

A comprehensive demonstration project showcasing Claude Code hooks functionality with a modern e-commerce database system using better-sqlite3, TypeScript, and comprehensive testing.

## Overview

This project demonstrates:
- **Claude Code PreTooluse Hooks** for security and workflow automation
- **Database Integration** with better-sqlite3 (migrated from sqlite3)
- **TypeScript** for type-safe development
- **Comprehensive Testing** with Jest framework
- **Security Patterns** for secret protection
- **Zero Vulnerabilities** - fully secure dependencies

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd claude-code-hooks-usage-demo
npm run setup

# Build and run
npm start

# Run tests
npm test

# Development mode
npm run dev
```

## Project Status

### Security Status:  Vulnerabilities
- **Dependencies**: 0 vulnerabilities found
- **Database**: Secure better-sqlite3 implementation
- **Testing**: 9/9 tests passing
- **Coverage**: Comprehensive test coverage

### Migration Status:  Complete
- **Database**: sqlite3  better-sqlite3
- **API**: Asynchronous  Synchronous
- **Performance**: Significantly improved
- **Type Safety**: Full TypeScript support

## Architecture

```
claude-code-hooks-usage-demo/
|--  .claude/                    # Claude Code configuration
|--  hooks/                     # Security hook implementations
|--  src/                       # Application source code
|   |--  main.ts              # Entry point with working examples
|   |--  schema.ts             # Database schema (better-sqlite3)
|   |--  types.ts              # TypeScript interfaces
|   |--  queries/              # Synchronous query modules
|       |--  customer_queries.ts
|       |--  product_queries.ts
|       |--  order_queries.ts
|       |--  analytics_queries.ts
|       |--  inventory_queries.ts
|       |--  promotion_queries.ts
|       |--  review_queries.ts
|       |--  shipping_queries.ts
|--  tests/                     # Database integration tests
|   |--  database.test.ts      # Core functionality tests
|   |--  setup.ts              # Jest configuration
|--  jest.config.cjs           # Jest configuration
|--  package.json             # Project with test scripts
|--  tsconfig.json            # TypeScript configuration
```

## Database Schema

The better-sqlite3 database contains a complete e-commerce system:

- **Customers**: User management with addresses and activity tracking
- **Products**: Catalog with categories and inventory management
- **Orders**: Order processing with items and status tracking
- **Reviews**: Product rating and review system
- **Promotions**: Discount and promotion management
- **Analytics**: Business intelligence and reporting

## Available Scripts

```bash
# Development
npm run setup          # Install dependencies and setup Claude Code
npm run dev            # Development mode with tsx
npm run build          # Build TypeScript to JavaScript
npm start              # Build and run application

# Examples
npm run example        # Run example queries

# Testing
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report

# Utilities
npm run clean          # Clean build artifacts
npm run type-check     # TypeScript type checking
npm run lint           # Code linting (if configured)
```

## Database Query Patterns

All query functions use the synchronous better-sqlite3 API:

```typescript
// Single record query
export function getCustomerByEmail(db: Database, email: string): any {
  const query = `SELECT * FROM customers WHERE email = ?`;
  const stmt = db.prepare(query);
  return stmt.get([email]);
}

// Multiple records query
export function getActiveCustomers(db: Database): any[] {
  const query = `SELECT * FROM customers WHERE status = 'active'`;
  const stmt = db.prepare(query);
  return stmt.all([]);
}
```

## Testing

The project includes comprehensive database integration tests:

### Test Coverage
- **Database Connections**: Connection management and configuration
- **Schema Validation**: Table structure and constraint verification
- **Data Operations**: CRUD operations with error handling
- **Transactions**: ACID properties and rollback scenarios
- **Performance**: Bulk operations and efficiency testing
- **Foreign Keys**: Constraint enforcement and relationship integrity

### Running Tests
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Results
- **9/9 tests passing** 
- **100% schema.ts coverage**
- **Performance validation**
- **Error handling verification**

## Security Features

### Claude Code Hooks
This project implements PreTooluse hooks for security:

- **Read Hook**: Blocks access to secret files (.env, certificates, SSH keys)
- **Write Hook**: Prevents writing files containing sensitive patterns
- **Query Hook**: Prevents duplicate database queries
- **TypeScript Hook**: Automatic compilation on file changes

### Protected Patterns
- API keys (OpenAI, GitHub, Slack tokens)
- Database connection strings
- Private key blocks
- Password/secret assignments
- Environment files and credentials

## Migration Details

### From sqlite3 to better-sqlite3
1. **API Migration**: Converted all async/await to synchronous calls
2. **Query Methods**: `db.get()`  `db.prepare().get()`
3. **Column Names**: Fixed schema mismatches (customer_id  id, order_date  created_at)
4. **Type Safety**: Updated TypeScript annotations
5. **Performance**: Significantly improved query performance

### Benefits Achieved
- **Zero Vulnerabilities**: All security issues resolved
- **Better Performance**: Synchronous database operations
- **Type Safety**: Full TypeScript support
- **Testing**: Comprehensive test coverage
- **Maintainability**: Modern, well-maintained dependencies

## Development Guidelines

### Working with Database Queries
- All queries must be in `src/queries/` directory
- Use parameterized queries to prevent SQL injection
- Follow synchronous better-sqlite3 patterns
- Handle errors with try/catch blocks
- Test all query functions

### Security Best Practices
- Never commit secrets to repository
- Use environment variables for configuration
- Follow established security patterns
- Test security hooks regularly
- Keep dependencies updated

## Claude Code Integration

### Hook Configuration
Hooks are configured in `.claude/settings.local.json`:
- Automatic interception of Read/Write operations
- Secret pattern detection and blocking
- TypeScript compilation on file changes
- Query deduplication for efficiency

### Usage Examples
```bash
# Claude Code will automatically:
# - Block reading of .env files
# - Prevent writing API keys to code
# - Compile TypeScript on changes
# - Deduplicate similar queries
```

## Contributing

1. Follow the established patterns for database queries
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure security hooks are working
5. Run full test suite before submitting

## License

ISC License - see LICENSE file for details

## Repository Status

** Ready for Public Deployment **
- Zero security vulnerabilities
- Comprehensive testing coverage
- Modern, secure dependencies
- Complete documentation
- Security hooks active
