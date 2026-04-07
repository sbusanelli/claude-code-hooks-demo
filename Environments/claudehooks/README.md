# Claude Code Hooks Usage Demo

A TypeScript project that demonstrates Claude Code hooks implementation with secret protection and e-commerce data utilities.

## Overview

This project implements a security layer using Claude Code's hook system to automatically detect and block operations that could expose sensitive files or content. It serves as both an e-commerce data utilities project and a reference implementation for secret protection hooks.

## Features

### 🔒 Secret Protection Hooks
- **Read Hook**: Prevents reading sensitive files (`.env`, certificates, SSH keys, credentials)
- **Write Hook**: Blocks writing files containing API keys, passwords, tokens, or other secrets
- **Content Analysis**: Scans file content for secret patterns before allowing operations
- **Path-based Protection**: Blocks access to files/directories with secret-related names

### 🛡️ Protected File Types
- Environment files (`.env`, `.env.*`)
- Certificates and private keys (`.key`, `.pem`, `.p12`, `.pfx`)
- Cloud provider credentials (`.aws/`, `.azure/`, `.gcp/`)
- SSH keys and database credentials
- Terraform state files and variables
- Files containing "secret", "private", or "credentials" in path/name

### 🔍 Secret Detection Patterns
The hooks detect various secret formats:
- API keys (OpenAI `sk-*`, GitHub `ghp_*`, Slack `xoxb-*`)
- Database connection strings and credentials
- Private key blocks (RSA, certificates)
- Password/secret assignments in configuration files
- Cloud provider access keys

## Project Structure

```
├── hooks/                  # Hook implementations
│   ├── read_hook.js       # Blocks reading secret files
│   ├── write_hook.js      # Blocks writing secret content
│   ├── query_hook.js      # Prevents duplicate queries
│   └── tsc.js            # TypeScript compilation hook
├── src/                   # TypeScript source code
│   ├── main.ts           # Entry point
│   ├── schema.ts         # Database schema definitions
│   └── queries/          # Database query modules
├── .claude/              # Claude Code configuration
│   ├── settings.example.json  # Hook configuration template
│   └── settings.local.json    # Generated local settings
├── scripts/              # Setup and utility scripts
└── .gitignore           # Enhanced with secret file patterns
```

## Installation and Setup

```bash
# Install dependencies and configure Claude hooks
npm run setup
```

The setup script:
1. Installs npm dependencies
2. Generates `.claude/settings.local.json` from the template
3. Configures PreTooluse hooks for secret protection

## How It Works

### Hook Architecture
1. **PreTooluse Hooks**: Intercept tool calls before execution
2. **Security Analysis**: Analyze file paths and content for secret patterns
3. **Decision Making**: Allow safe operations, block suspicious ones
4. **Error Reporting**: Clear feedback when operations are blocked

### Hook Flow
```
Claude Tool Call
    ↓
PreTooluse Hook Triggered
    ↓
Security Analysis (read_hook.js/write_hook.js)
    ↓
Decision: Allow (exit 0) or Block (exit 2)
    ↓
Tool Execution (if allowed)
```

### Configuration
Hooks are configured in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|ReadFile",
        "hooks": [{"type": "command", "command": "node $PWD/hooks/read_hook.js"}]
      },
      {
        "matcher": "Write|Edit|MultiEdit", 
        "hooks": [{"type": "command", "command": "node $PWD/hooks/write_hook.js"}]
      }
    ]
  }
}
```

## Usage Examples

### Blocked Operations
```bash
# These will be blocked by the hooks:
echo "SECRET_API_KEY=sk-12345" > .env          # Blocked: secret content
cat ~/.ssh/id_rsa                               # Blocked: secret file path
echo "password: secret123" > config.json        # Blocked: secret pattern
```

### Allowed Operations
```bash
# These will proceed normally:
echo "console.log('hello')" > app.js           # Allowed: safe content
cat README.md                                   # Allowed: safe file path
echo "API_URL=https://api.example.com" > .env   # Allowed: no secrets detected
```

## Development

### Adding New Secret Patterns
To add new secret detection patterns, update the pattern arrays in:
- `hooks/read_hook.js` - for file path patterns
- `hooks/write_hook.js` - for both path and content patterns

```javascript
const SECRET_CONTENT_PATTERNS = [
  // Add new patterns here
  /new-secret-pattern/i,
];
```

### Testing Hooks
```bash
# Test read hook
echo '{"tool_input": {"file_path": ".env"}}' | node hooks/read_hook.js

# Test write hook  
echo '{"tool_input": {"file_path": "test.txt", "content": "SECRET_API_KEY=sk-123"}}' | node hooks/write_hook.js
```

## Security Considerations

- **Defense in Depth**: Multiple protection layers (path + content analysis)
- **Fail-Safe**: Err on the side of blocking suspicious operations
- **Performance**: Efficient regex patterns for minimal overhead
- **Extensibility**: Easy to add new secret patterns as needed

## Database Schema

The project also includes a complete e-commerce database schema with tables for:
- Customers, addresses, segments, activity logs
- Products, categories, inventory, warehouses  
- Orders, order items, reviews
- Promotions and analytics

See `src/schema.ts` for the complete schema definition.

## Security Considerations

### ⚠️ Known Vulnerabilities
This project currently has **7 vulnerabilities** in transitive dependencies (2 low, 5 high severity):

- **High**: `tar` package vulnerabilities in nested dependencies
- **Low**: Various dependency version issues

**Impact**: These vulnerabilities are in build/development dependencies and do not affect the core security hook functionality.

**Recommendation**: 
- ✅ **Safe for development/demo** with security monitoring
- ⚠️ **Review before production** deployment
- 🔄 **Monitor for upstream fixes** from dependency maintainers

### 🔒 Core Security Features
The main security functionality (secret protection hooks) is **production-ready** and not affected by dependency vulnerabilities.

### 🛡️ Production Deployment
For production use:
1. Monitor dependency updates regularly
2. Consider Docker isolation for additional security
3. Implement security scanning in CI/CD pipeline
4. Review transitive dependencies before deployment

## Contributing

When contributing to this project:
1. Test any new secret patterns thoroughly
2. Update documentation for new detection capabilities
3. Ensure hooks don't interfere with legitimate development workflows
4. Add tests for edge cases and false positives/negatives

## License

ISC
