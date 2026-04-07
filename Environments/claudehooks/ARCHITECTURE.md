# Claude Code Hooks Usage Demo - Architecture Diagram

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Claude Code Environment"
        CC[Claude Code IDE]
        HOOKS[PreTooluse Hooks]
    end
    
    subgraph "Project Repository"
        ROOT[claude-code-hooks-usage-demo/]
        
        subgraph "Configuration Layer"
            SETTINGS[.claude/settings.local.json]
            ENV[.env.example]
            GITIGNORE[.gitignore]
        end
        
        subgraph "Security Layer"
            READHOOK[hooks/read_hook.js]
            WRITEHOOK[hooks/write_hook.js]
            QUERYHOOK[hooks/query_hook.js]
            TSCHOOK[hooks/tsc.js]
        end
        
        subgraph "Application Layer"
            MAIN[src/main.ts]
            EXAMPLE[src/example.ts]
            TYPES[src/types.ts]
            SCHEMA[src/schema.ts]
        end
        
        subgraph "Data Layer"
            DB[(ecommerce.db)]
            QUERIES[src/queries/]
        end
        
        subgraph "Build & Tools"
            PACKAGE[package.json]
            TSCONFIG[tsconfig.json]
            SCRIPTS[scripts/]
            DOCS[README.md, CLAUDE.md]
        end
    end
    
    %% Security Hook Flow
    CC --> HOOKS
    HOOKS --> READHOOK
    HOOKS --> WRITEHOOK
    HOOKS --> QUERYHOOK
    HOOKS --> TSCHOOK
    
    %% Configuration Flow
    SETTINGS --> READHOOK
    SETTINGS --> WRITEHOOK
    SETTINGS --> QUERYHOOK
    
    %% Application Flow
    MAIN --> SCHEMA
    MAIN --> QUERIES
    QUERIES --> DB
    EXAMPLE --> QUERIES
    EXAMPLE --> DB
    
    %% Type Safety
    TYPES --> MAIN
    TYPES --> EXAMPLE
    TYPES --> QUERIES
    
    %% Build Process
    TSCONFIG --> MAIN
    PACKAGE --> SCRIPTS
    SCRIPTS --> SETTINGS
```

## 🔒 Security Hook Architecture

```mermaid
graph LR
    subgraph "Claude Code Tool Call"
        TOOL[Read/Write/Edit Tool]
    end
    
    subgraph "PreTooluse Interception"
        INTERCEPT[Hook Trigger]
    end
    
    subgraph "Security Analysis"
        PATHCHECK[Path Analysis]
        CONTENTCHECK[Content Analysis]
        DECISION[Security Decision]
    end
    
    subgraph "Outcomes"
        ALLOW[✅ Allow Operation]
        BLOCK[🚫 Block Operation]
        ERROR[❌ Error Message]
    end
    
    TOOL --> INTERCEPT
    INTERCEPT --> PATHCHECK
    INTERCEPT --> CONTENTCHECK
    PATHCHECK --> DECISION
    CONTENTCHECK --> DECISION
    DECISION --> ALLOW
    DECISION --> BLOCK
    BLOCK --> ERROR
```

## 📊 Data Flow Architecture

```mermaid
graph TD
    subgraph "Application Entry Points"
        ENTRY1[npm run dev]
        ENTRY2[npm run example]
        ENTRY3[npm run start]
    end
    
    subgraph "Core Application"
        MAINAPP[main.ts]
        EXAMPLEAPP[example.ts]
    end
    
    subgraph "Database Layer"
        SCHEMALAYER[schema.ts]
        QUERYLAYER[queries/*.ts]
        DBLAYER[(SQLite Database)]
    end
    
    subgraph "Query Categories"
        CUST[customer_queries.ts]
        PROD[product_queries.ts]
        ORDER[order_queries.ts]
        ANALYT[analytics_queries.ts]
        INV[inventory_queries.ts]
        PROM[promotion_queries.ts]
        REV[review_queries.ts]
        SHIP[shipping_queries.ts]
    end
    
    ENTRY1 --> MAINAPP
    ENTRY2 --> EXAMPLEAPP
    ENTRY3 --> MAINAPP
    
    MAINAPP --> SCHEMALAYER
    EXAMPLEAPP --> SCHEMALAYER
    
    SCHEMALAYER --> DBLAYER
    QUERYLAYER --> DBLAYER
    
    QUERYLAYER --> CUST
    QUERYLAYER --> PROD
    QUERYLAYER --> ORDER
    QUERYLAYER --> ANALYT
    QUERYLAYER --> INV
    QUERYLAYER --> PROM
    QUERYLAYER --> REV
    QUERYLAYER --> SHIP
```

## 🛡️ Security Pattern Detection

```mermaid
graph TB
    subgraph "Read Hook Protection"
        RPATH[Secret File Patterns]
        RPATH --> RENV[.env files]
        RPATH --> RCERT[Certificates (.pem, .key)]
        RPATH --> RSSH[SSH keys]
        RPATH --> RCONFIG[Config files]
        RPATH --> RCLOUD[Cloud credentials]
    end
    
    subgraph "Write Hook Protection"
        WPATH[File Path Blocking]
        WCONTENT[Content Pattern Detection]
        
        WPATH --> WPATHENV[.env paths]
        WPATH --> WPATHSECRET[secret/ paths]
        
        WCONTENT --> WPASSWORD[password= patterns]
        WCONTENT --> WAPIKEY[API key patterns]
        WCONTENT --> WTOKEN[token patterns]
        WCONTENT --> WPRIVATE[Private key blocks]
    end
    
    subgraph "Detection Patterns"
        OPENAI[sk-* OpenAI keys]
        GITHUB[ghp_* GitHub tokens]
        SLACK[xoxb-* Slack tokens]
        AWS[AWS access keys]
        DB[Database credentials]
    end
    
    WCONTENT --> OPENAI
    WCONTENT --> GITHUB
    WCONTENT --> SLACK
    WCONTENT --> AWS
    WCONTENT --> DB
```

## 🗂️ Project Structure Overview

```
claude-code-hooks-usage-demo/
├── 📁 .claude/                    # Claude Code configuration
│   ├── 📄 settings.example.json   # Hook configuration template
│   └── 📄 settings.local.json    # Active hook settings
│
├── 📁 hooks/                     # Security hook implementations
│   ├── 🔒 read_hook.js          # Blocks reading secret files
│   ├── 🛡️ write_hook.js         # Blocks writing secret content
│   ├── 🔍 query_hook.js          # Prevents duplicate queries
│   └── ⚙️ tsc.js               # TypeScript compilation hook
│
├── 📁 src/                       # Application source code
│   ├── 🚀 main.ts              # Application entry point
│   ├── 📚 example.ts            # Usage examples
│   ├── 🏗️ schema.ts             # Database schema
│   ├── 📋 types.ts              # TypeScript interfaces
│   └── 📁 queries/              # Database query modules
│       ├── 👥 customer_queries.ts
│       ├── 🛍️ product_queries.ts
│       ├── 📦 order_queries.ts
│       ├── 📊 analytics_queries.ts
│       ├── 📦 inventory_queries.ts
│       ├── 🎫 promotion_queries.ts
│       ├── ⭐ review_queries.ts
│       └── 🚚 shipping_queries.ts
│
├── 📁 scripts/                   # Utility scripts
│   └── 🔧 init-claude.js       # Hook setup script
│
├── 📄 .env.example              # Environment template
├── 📄 .gitignore               # Git ignore rules
├── 📄 package.json             # Project configuration
├── 📄 tsconfig.json            # TypeScript config
├── 📖 README.md                # Project documentation
└── 📋 CLAUDE.md                # Claude Code guidance
```

## 🔄 Hook Execution Flow

```mermaid
sequenceDiagram
    participant C as Claude Code
    participant H as Hook System
    participant R as read_hook.js
    participant W as write_hook.js
    participant Q as query_hook.js
    participant F as File System
    
    C->>H: Tool Call (Read/Write/Edit)
    H->>H: Determine Hook Type
    
    alt Read Operation
        H->>R: Check file path
        alt Secret File Pattern
            R->>C: 🚫 Access Denied
            C->>F: Operation Blocked
        else Safe File
            R->>C: ✅ Allow Read
            C->>F: Read File
        end
    else Write Operation
        H->>W: Check file path & content
        alt Secret Pattern Detected
            W->>C: 🚫 Access Denied
            C->>F: Operation Blocked
        else Safe Content
            W->>C: ✅ Allow Write
            C->>F: Write File
        end
    else Query Operation
        H->>Q: Analyze query duplication
        alt Duplicate Found
            Q->>C: 🚫 Query Duplicated
            C->>F: Operation Blocked
        else Unique Query
            Q->>C: ✅ Allow Query
            C->>F: Execute Query
        end
    end
```

## 🎯 Key Components Summary

| Layer | Component | Purpose | Security Impact |
|--------|-----------|---------|----------------|
| **Configuration** | `.claude/settings.local.json` | Hook routing & timeouts |
| **Security** | `hooks/read_hook.js` | Blocks secret file access |
| **Security** | `hooks/write_hook.js` | Blocks secret content writing |
| **Security** | `hooks/query_hook.js` | Prevents duplicate queries |
| **Application** | `src/main.ts` | Demo entry point |
| **Data** | `src/queries/` | Business logic & data access |
| **Types** | `src/types.ts` | Type safety & interfaces |
| **Database** | `SQLite` | Data persistence layer |

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV[Local Development]
        HOOKS_LOCAL[Local Hooks]
        DB_LOCAL[Local SQLite]
    end
    
    subgraph "Production Deployment"
        PROD[Production Server]
        HOOKS_PROD[Production Hooks]
        DB_PROD[Production Database]
        DOCKER[Docker Container]
        CI[CI/CD Pipeline]
    end
    
    subgraph "Security Layers"
        HOOK_SECURITY[Hook Protection]
        GIT_SECURITY[.gitignore Rules]
        ENV_SECURITY[Environment Variables]
        AUDIT[Security Audit]
    end
    
    DEV --> HOOKS_LOCAL
    HOOKS_LOCAL --> DB_LOCAL
    
    CI --> PROD
    PROD --> DOCKER
    DOCKER --> HOOKS_PROD
    HOOKS_PROD --> DB_PROD
    
    HOOKS_LOCAL --> HOOK_SECURITY
    HOOKS_PROD --> HOOK_SECURITY
    PROD --> GIT_SECURITY
    PROD --> ENV_SECURITY
    CI --> AUDIT
```

This architecture provides a comprehensive view of how the Claude Code Hooks Usage Demo project is structured, how security hooks protect against secret exposure, and how all components interact to provide a robust demonstration of Claude Code's hook system.
