# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package that integrates with **Firefly III**, a self-hosted personal finance manager. The node provides workflow automation capabilities for managing transactions, accounts, budgets, categories, tags, rules, and other Firefly III resources through n8n workflows.

**Key Technologies:**
- TypeScript (strict mode)
- n8n-workflow SDK
- OAuth2 authentication (PKCE grant)
- Firefly III REST API v1 (6.4.0)

## Development Commands

```bash
# Install dependencies (pnpm required)
pnpm install

# Build TypeScript and copy icons
pnpm build

# Watch mode for development
pnpm dev

# Start: build + restart n8n-dev Docker container + tail logs
pnpm start

# Code quality
pnpm lint
pnpm lintfix
pnpm format

# Pre-publish validation
pnpm prepublishOnly
```

## Important Folders

### `nodes/FireFlyIII/`
Main node implementation containing:
- **`Fireflyiii.node.ts`**: Core node class with `description` (defines UI/parameters) and `execute()` method (handles operations)
- **`actions/`**: Resource-specific operation definitions organized by endpoint:
  - `transactions/` - Create, list, update, delete transactions
  - `accounts/` - Account management
  - `bills/` - Bill management (full CRUD + attachments, rules, transactions)
  - `categories/` - Category operations
  - `tags/` - Tag management
  - `rules/` - Rule and rule group operations
  - `general/` - Export, insights, search operations
  - `about/` - System information
- **`utils/`**: Shared utilities
  - `ApiRequest.ts` - Main Firefly III API request handler with OAuth2
  - `ApiRequestV2.ts` - API v2 request handler (partial implementation)

### `credentials/`
- **`FireflyiiiOAuth2Api.credentials.ts`**: OAuth2 credential configuration with PKCE grant type

### `dist/`
Build output directory (compiled JavaScript + icons)

## Firefly III API Integration

### API Structure
The Firefly III API follows REST conventions with versioned endpoints. This node uses **Firefly III API v1 (6.4.0)** exclusively.

**Implemented Resources:**
- Transactions (full CRUD + attachments, piggy bank events, splits)
- Accounts (full CRUD)
- Bills (full CRUD + attachments, rules, transactions)
- Categories (full CRUD)
- Tags (full CRUD)
- Rules & Rule Groups (full CRUD)
- Budgets (read-only)
- Search (query-based search with pagination)
- Export (data export functionality)
- System information (about, preferences, cron)

**Not Yet Implemented:**
- Attachments (as standalone resource)
- Currencies
- Object Groups
- Piggy Banks (as standalone resource)
- Recurrences (partial)
- Webhooks

Refer to [Firefly III API Documentation](https://api-docs.firefly-iii.org/) for endpoint specifications.

### Authentication Pattern
The node uses **OAuth2 with PKCE** grant type. Users must:
1. Self-host Firefly III instance
2. Generate OAuth2 client credentials from their instance
3. Configure n8n credentials with base URL, client ID, client secret, and OAuth endpoints

Key credential fields in `FireflyiiiOAuth2Api.credentials.ts`:
- `baseUrl` - Firefly III instance URL (no trailing slash)
- `clientId` / `clientSecret` - OAuth2 credentials
- `authUrl` - `/oauth/authorize` endpoint
- `accessTokenUrl` - `/oauth/token` endpoint
- Grant type: `pkce` (hardcoded)

### API Request Helper
**`fireflyApiRequest()`** in `utils/ApiRequest.ts` handles all API communication:
- Constructs URLs with base URL + `/api/v1` + endpoint
- Manages OAuth2 token authentication via `requestWithAuthentication`
- Filters empty query parameters
- Supports optional `X-Trace-Id` header for debugging
- Conditionally includes request body (not for GET/HEAD/DELETE)

## Node Implementation Pattern

n8n nodes follow a specific structure defined by the n8n SDK. This node adheres to those conventions:

### Resource-Operation Model
The node uses n8n's resource-operation pattern:
1. **Resource**: Top-level entity (transactions, accounts, categories, etc.)
2. **Operation**: Action to perform (list, get, create, update, delete)

Defined in `Fireflyiii.node.ts`:
```typescript
properties: [
  { name: 'resource', type: 'options' },  // Select resource
  { name: 'operation', type: 'options' }, // Select operation (depends on resource)
  // ... operation-specific fields
]
```

### Field Definitions
Each resource has corresponding files in `actions/[resource]/`:
- **`[resource].resource.ts`**: Exports `[resource]Operations` (operation dropdown) and `[resource]Fields` (operation-specific parameters)
- Field definitions use `displayOptions.show` to conditionally display based on selected resource/operation

Example pattern:
```typescript
export const transactionsOperations: INodeProperties[] = [
  { displayName: 'Operation', name: 'operation', type: 'options', options: [...] }
];

export const transactionsFields: INodeProperties[] = [
  {
    displayName: 'Transaction ID',
    name: 'transactionId',
    displayOptions: { show: { resource: ['transactions'], operation: ['getTransaction'] } }
  }
];
```

### Execute Method Flow
The `execute()` method in `Fireflyiii.node.ts` follows this pattern:
1. Get selected resource and operation from user input
2. Extract parameters based on operation requirements
3. Build API request using `fireflyApiRequest()`
4. Handle response data transformation
5. Return JSON items for n8n workflow

### Special Handling
- **Transaction Splits**: Firefly III supports split transactions (multiple journals per transaction). The node handles both single and split transactions through `transactionsData` fixed collection.
- **Pagination**: List operations support `limit` and `page` parameters through `paginationOptions` collection
- **Comma-Separated Fields**: Helper function `parseCommaSeparatedFields()` converts comma-separated strings to arrays for tags and external URLs
- **Boolean Query Parameters**: Firefly III expects `true`/`false` strings, not boolean types

## Development Best Practices

### Adding New Operations
1. Create or update resource file in `actions/[resource]/`
2. Define operation in `[resource]Operations` array
3. Add operation-specific fields to `[resource]Fields`
4. Import and spread into main node description: `...transactionsOperations, ...transactionsFields`
5. Implement operation logic in `execute()` method
6. Test with actual Firefly III instance

### Field Naming Conventions
- Use camelCase for internal field names (`transactionId`, `sourceAccount`)
- Match Firefly III API parameter names where possible for clarity
- Use `displayName` for user-facing labels (title case)
- Add `hint` for additional context, `description` for explanations

### Fixed Collections vs Collections
- **Fixed Collection** (`type: 'fixedCollection'`): Use for structured data with multiple items (e.g., transaction splits)
- **Collection** (`type: 'collection'`): Use for optional parameter grouping (e.g., filters, settings)

### Error Handling
The node relies on n8n's built-in error handling. API errors bubble up through `requestWithAuthentication`. Consider:
- Validating required fields before API calls
- Providing clear `description` text for complex fields
- Using `notice` type fields for important clarifications

### Testing Workflow
1. Build: `pnpm build`
2. Ensure n8n-dev Docker container is running with this node installed
3. Restart container: `docker restart n8n-dev`
4. Test operations through n8n UI
5. Verify API responses match expected Firefly III behavior

### ESLint Configuration
The project uses n8n-specific ESLint rules via `eslint-plugin-n8n-nodes-base`. Some rules are disabled for flexibility:
- `node-execute-block-missing-continue-on-fail` (credentials)
- `node-resource-description-filename-against-convention` (nodes)
- Several others for practical development

Run `pnpm lintfix` to auto-fix issues before committing.

## Firefly III API Gotchas

### Transaction Type Handling
Firefly III enforces strict transaction type rules:
- **Withdrawal**: Requires source account (asset) and destination account (expense)
- **Deposit**: Requires source account (revenue) and destination account (asset)
- **Transfer**: Requires two asset accounts
- **Opening Balance**: Special type for initial account balances

The node exposes a `type` dropdown in transaction operations to ensure correct type selection.

### Transaction Splits
A single "transaction" in Firefly III can contain multiple "journals" (splits). When updating:
- Use `transaction_journal_id` to target specific splits
- Omit journal ID to create new splits
- See [Firefly III API Special Cases](https://docs.firefly-iii.org/references/firefly-iii/api/specials/) for split update rules

### Date Formats
Firefly III expects dates in `YYYY-MM-DD` format for transaction dates and filters. The node passes dates as strings without transformation.

### Query Parameters
List operations use query parameters for filtering:
- Empty string values are filtered out in `fireflyApiRequest()`
- Boolean parameters must be strings (`'true'`, `'false'`)
- Arrays (like tags) must be formatted according to API requirements

## Git Workflow

This project uses feature branches and follows semantic versioning (currently v0.1.2). The current working branch is `v1.0` with uncommitted changes to `Fireflyiii.node.ts`.

**Main branch**: `master`  
**Current branch**: `v1.0`

Recent work includes:
- Adding pagination options to searchAll operation
- Dependency updates and Docker development workflow improvements
