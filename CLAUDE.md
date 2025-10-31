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
  - `budgets/` - Budget management (full CRUD + limits, transactions)
  - `categories/` - Category operations
  - `tags/` - Tag management
  - `rules/` - Rule and rule group operations
  - `piggyBanks/` - Piggy bank management (full CRUD + events, attachments)
  - `objectGroups/` - Object group management (list, get, update, delete, related objects)
  - `general/` - Export, insights, search operations
  - `about/` - System information
- **`utils/`**: Shared utilities
  - `ApiRequest.ts` - Main Firefly III API request handler with OAuth2
  - `ApiRequestV2.ts` - API v2 request handler (partial implementation)

### `credentials/`
- **`FireflyiiiOAuth2Api.credentials.ts`**: OAuth2 credential configuration with PKCE grant type

### `dist/`
Build output directory (compiled JavaScript + icons)

### `.claude/docs/`
Reference documentation for development:
- **`firefly-iii-6.4.0-v1.yaml`**: Complete OpenAPI specification for Firefly III API v1 (6.4.0). Use this as the authoritative reference for endpoint specifications, request/response formats, and API behavior.
- **`API_REQUEST_COMPARISON.md`**: Technical comparison between ApiRequest implementations
- Additional n8n node development guides and code explanations

## Firefly III API Integration

### API Structure
The Firefly III API follows REST conventions with versioned endpoints. This node uses **Firefly III API v1 (6.4.0)** exclusively.

**Implemented Resources:**
- **General Operations** (`/api/v1/search/*`, `/api/v1/data/export`, `/api/v1/insight/*`): Search, export, insights (3 operations)
- **About** (`/api/v1/about`, `/api/v1/cron/*`): System info, user info, cron jobs (3 operations)
- **Accounts** (`/api/v1/accounts/*`): Full CRUD + related transactions, attachments, piggy banks (6 operations)
- **Available Budgets** (`/api/v1/available-budgets/*`): total available amount that the user has made available to themselves. (2 operations)
- **Bills** (`/api/v1/bills/*`): Full CRUD + attachments, rules, transactions (8 operations)
- **Budgets** (`/api/v1/budgets/*`): Full CRUD + limits, spent amounts, transactions (15 operations)
- **Transactions** (`/api/v1/transactions/*`): Full CRUD + attachments, piggy bank events, splits (6 operations)
- **Categories** (`/api/v1/categories/*`): Full CRUD + transactions (6 operations)
- **Tags** (`/api/v1/tags/*`): Full CRUD + transactions, attachments (7 operations)
- **Rules & Rule Groups** (`/api/v1/rules/*`, `/api/v1/rule-groups/*`): Full CRUD + testing, triggering (14 operations)
- **Piggy Banks** (`/api/v1/piggy-banks/*`): Full CRUD + events, attachments (7 operations)
- **Object Groups** (`/api/v1/object-groups/*`): List, get, update, delete + related bills/piggy banks (6 operations)
  - **Note**: Object groups cannot be created directly; they are auto-created when bills or piggy banks use `object_group_title` parameter
- **Recurrences** (`/api/v1/recurrences/*`): Full CRUD + trigger operations for recurring transactions (6 operations)
  - **Note**: Complex nested structures for repetitions (schedule patterns) and transactions (transaction details)

**API Endpoints Not Yet Implemented:**
- Attachments (as standalone resource - `/api/v1/attachments/*`)
- Autocomplete (`/api/v1/autocomplete/*`)
- Charts (`/api/v1/chart/*`)
- Configuration (`/api/v1/configuration/*`)
- Currencies (`/api/v1/currencies/*`)
- Currency Exchange Rates (`/api/v1/cer/*`)
- Links (`/api/v1/transaction-links/*`, `/api/v1/link-types/*`)
- Preferences (`/api/v1/preferences/*`)
- Summary (`/api/v1/summary/*`)
- Webhooks (`/api/v1/webhooks/*`)

**API Reference:**
- [Firefly III API Documentation](https://api-docs.firefly-iii.org/) - Official online documentation
- `.claude/docs/firefly-iii-6.4.0-v1.yaml` - Complete OpenAPI specification (authoritative reference)

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

**IMPORTANT**: Follow the established task documentation pattern located in `.claude/tasks/`:

1. **Design Phase**: Create `DESIGN_[RESOURCE]_ENDPOINT.md` documenting:
   - API endpoint analysis (all operations, parameters, response formats)
   - File structure design
   - Field definitions with types and constraints
   - Execute method implementation patterns
   - Integration points with main node file
   - Special considerations and API quirks
   - Testing checklist

2. **Implementation Phase**: Follow the design document, then create `[RESOURCE]_IMPLEMENTATION_SUMMARY.md` documenting:
   - Files created/modified with line counts
   - All operations implemented
   - Technical implementation details
   - Build and quality verification status
   - Testing checklist and recommendations
   - Next steps for deployment

**Reference Examples**: See `.claude/tasks/DESIGN_BILLS_ENDPOINT.md` and `.claude/tasks/BILLS_IMPLEMENTATION_SUMMARY.md` for the Bills API implementation pattern.

### Implementation Steps
1. Create or update resource file in `actions/[resource]/`
2. Define operation in `[resource]Operations` array
3. Add operation-specific fields to `[resource]Fields`
4. Import and spread into main node description: `...transactionsOperations, ...transactionsFields`
5. Implement operation logic in `execute()` method
6. Test with actual Firefly III instance
7. Document implementation in `.claude/tasks/` following established pattern

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

### Object Group Auto-Creation and Auto-Deletion
Object groups **cannot be created directly** through the API. Instead:
- Create/update **bills** or **piggy banks** with `object_group_title` parameter
- Firefly III automatically creates the object group if it doesn't exist
- Groups **auto-delete** when no objects are linked to them anymore
- Only **title** and **order** fields can be updated; all other fields are read-only

**Example - Creating an object group via bill:**
```typescript
// Creating a bill with object_group_title automatically creates the group
{
  name: "Internet Bill",
  amount_min: "50",
  amount_max: "60",
  date: "2025-01-15",
  repeat_freq: "monthly",
  object_group_title: "Monthly Utilities"  // Creates "Monthly Utilities" group
}
```

## Git Workflow

This project uses feature branches and follows semantic versioning (currently v0.1.2). The current working branch is `v1.0` with uncommitted changes to `Fireflyiii.node.ts`.

**Main branch**: `master`  
**Current branch**: `v1.0`

Recent work includes:
- Adding pagination options to searchAll operation
- Dependency updates and Docker development workflow improvements
