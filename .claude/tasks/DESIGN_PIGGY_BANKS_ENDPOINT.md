# Piggy Banks Endpoint Implementation Design

**Target**: Firefly III API v1 (6.4.0) `/api/v1/piggy-banks`  
**Pattern**: Follow existing resource structure (bills, budgets, accounts)  
**Status**: Design Phase

---

## 1. API Endpoint Analysis

### Firefly III Piggy Banks API v1 Operations

Based on Firefly III API OpenAPI specification (firefly-iii-6.4.0-v1.yaml):

| Operation | HTTP Method | Endpoint | Description |
|-----------|-------------|----------|-------------|
| **List Piggy Banks** | GET | `/api/v1/piggy-banks` | Retrieve all piggy banks with pagination |
| **Get Piggy Bank** | GET | `/api/v1/piggy-banks/{id}` | Retrieve single piggy bank by ID |
| **Create Piggy Bank** | POST | `/api/v1/piggy-banks` | Create a new piggy bank |
| **Update Piggy Bank** | PUT | `/api/v1/piggy-banks/{id}` | Update existing piggy bank |
| **Delete Piggy Bank** | DELETE | `/api/v1/piggy-banks/{id}` | Delete a piggy bank |
| **Get Events** | GET | `/api/v1/piggy-banks/{id}/events` | List all events (add/remove money) for a piggy bank |
| **Get Attachments** | GET | `/api/v1/piggy-banks/{id}/attachments` | List attachments for a piggy bank |

**Total Operations**: 7

### Related Endpoints (Already Implemented)

- **Account Piggy Banks**: GET `/api/v1/accounts/{id}/piggy-banks` - Already handled in accounts resource
- **Autocomplete**: GET `/api/v1/autocomplete/piggy-banks` - Not needed for n8n workflow automation
- **Export**: GET `/api/v1/data/export/piggy-banks` - Already handled in general resource

### Key Parameters

**Common Parameters:**
- `piggyBankId` (path parameter) - Piggy bank identifier for single operations
- `page`, `limit` (query) - Pagination for list operations

**Piggy Bank Data Fields (Create/Update):**

**Required Fields (Create):**
- `name` (string) - Piggy bank name
- `account_id` (string) - Associated asset account ID
- `target_amount` (string/decimal) - Target savings amount
- `start_date` (date, YYYY-MM-DD) - Start date

**Optional Fields:**
- `current_amount` (string/decimal) - Current saved amount
- `target_date` (date, YYYY-MM-DD) - Target completion date
- `order` (integer) - Display order
- `active` (boolean, read-only) - Active status
- `notes` (string) - Additional notes
- `object_group_id` (string) - Object group ID
- `object_group_title` (string) - Object group name

**Account Association (for multi-account support):**
- `accounts` (array of PiggyBankAccountStore)
  - `id` (string, required) - Account ID
  - `name` (string) - Account name
  - `current_amount` (string) - Amount in this account

---

## 2. File Structure Design

Following the established pattern in `nodes/FireFlyIII/actions/`:

```
nodes/FireFlyIII/actions/piggyBanks/
└── piggyBanks.resource.ts     # Main operations and fields export
```

**Decision**: Single file implementation. Piggy banks have fewer fields than transactions or bills, so no need to extract field definitions to a separate file.

**Naming Convention**: Use `piggyBanks` (camelCase) for directory and file names, matching existing patterns (accounts, categories, tags).

---

## 3. piggyBanks.resource.ts Structure

### 3.1 Operations Definition

```typescript
/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import { INodeProperties } from 'n8n-workflow';

export const piggyBanksOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['piggyBanks'],
      },
    },
    options: [
      {
        name: 'List Piggy Banks',
        value: 'listPiggyBanks',
        description: 'Retrieve all piggy banks',
        action: 'List piggy banks',
      },
      {
        name: 'Get Piggy Bank',
        value: 'getPiggyBank',
        description: 'Retrieve a single piggy bank',
        action: 'Get piggy bank',
      },
      {
        name: 'Create Piggy Bank',
        value: 'createPiggyBank',
        description: 'Create a new piggy bank',
        action: 'Create piggy bank',
      },
      {
        name: 'Update Piggy Bank',
        value: 'updatePiggyBank',
        description: 'Update an existing piggy bank',
        action: 'Update piggy bank',
      },
      {
        name: 'Delete Piggy Bank',
        value: 'deletePiggyBank',
        description: 'Delete a piggy bank',
        action: 'Delete piggy bank',
      },
      {
        name: 'Get Events',
        value: 'getEvents',
        description: 'List all events (adding/removing money) for a piggy bank',
        action: 'Get piggy bank events',
      },
      {
        name: 'Get Attachments',
        value: 'getAttachments',
        description: 'List attachments for a piggy bank',
        action: 'Get piggy bank attachments',
      },
    ],
    default: 'listPiggyBanks',
  },
];
```

### 3.2 Field Definitions Structure

```typescript
export const piggyBanksFields: INodeProperties[] = [
  // ----------------------------------
  //    Shared Piggy Bank ID Field
  // ----------------------------------
  {
    displayName: 'Piggy Bank ID',
    name: 'piggyBankId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['piggyBanks'],
        operation: [
          'getPiggyBank',
          'updatePiggyBank',
          'deletePiggyBank',
          'getEvents',
          'getAttachments',
        ],
      },
    },
    description: 'The ID of the piggy bank',
  },

  // ----------------------------------
  //    CREATE PIGGY BANK FIELDS
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['piggyBanks'],
        operation: ['createPiggyBank'],
      },
    },
    description: 'Name of the piggy bank',
  },
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['piggyBanks'],
        operation: ['createPiggyBank'],
      },
    },
    description: 'The ID of the asset account this piggy bank is connected to',
  },
  {
    displayName: 'Target Amount',
    name: 'targetAmount',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['piggyBanks'],
        operation: ['createPiggyBank'],
      },
    },
    description: 'The target amount to save (e.g., "500.00")',
  },
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['piggyBanks'],
        operation: ['createPiggyBank'],
      },
    },
    placeholder: 'YYYY-MM-DD',
    description: 'The date you started with this piggy bank',
  },

  // Optional Create Fields
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['piggyBanks'],
        operation: ['createPiggyBank'],
      },
    },
    options: [
      {
        displayName: 'Current Amount',
        name: 'currentAmount',
        type: 'string',
        default: '',
        description: 'The current amount saved in the piggy bank',
      },
      {
        displayName: 'Target Date',
        name: 'targetDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'The date you intend to finish saving money',
      },
      {
        displayName: 'Order',
        name: 'order',
        type: 'number',
        default: 0,
        description: 'Display order for the piggy bank',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Additional notes about the piggy bank',
      },
      {
        displayName: 'Object Group ID',
        name: 'objectGroupId',
        type: 'string',
        default: '',
        description: 'The group ID this piggy bank belongs to',
      },
      {
        displayName: 'Object Group Title',
        name: 'objectGroupTitle',
        type: 'string',
        default: '',
        description: 'The name of the group this piggy bank belongs to',
      },
    ],
  },

  // ----------------------------------
  //    UPDATE PIGGY BANK FIELDS
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['piggyBanks'],
        operation: ['updatePiggyBank'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name of the piggy bank',
      },
      {
        displayName: 'Target Amount',
        name: 'targetAmount',
        type: 'string',
        default: '',
        description: 'The target amount to save',
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'The date you started with this piggy bank',
      },
      {
        displayName: 'Target Date',
        name: 'targetDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'The date you intend to finish saving money',
      },
      {
        displayName: 'Order',
        name: 'order',
        type: 'number',
        default: 0,
        description: 'Display order for the piggy bank',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Additional notes about the piggy bank',
      },
      {
        displayName: 'Object Group ID',
        name: 'objectGroupId',
        type: 'string',
        default: '',
        description: 'The group ID this piggy bank belongs to',
      },
      {
        displayName: 'Object Group Title',
        name: 'objectGroupTitle',
        type: 'string',
        default: '',
        description: 'The name of the group this piggy bank belongs to',
      },
    ],
  },

  // ----------------------------------
  //      PAGINATION OPTIONS
  // ----------------------------------
  {
    displayName: 'Options',
    name: 'paginationOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['piggyBanks'],
        operation: ['listPiggyBanks', 'getEvents', 'getAttachments'],
      },
    },
    options: [
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        description: 'Number of items per page',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 1,
        description: 'Page number to retrieve',
      },
    ],
  },
];
```

---

## 4. Execute Method Implementation

### 4.1 Operation Routing Pattern

```typescript
// In Fireflyiii.node.ts execute() method

const resource = this.getNodeParameter('resource', 0) as string;
const operation = this.getNodeParameter('operation', 0) as string;

if (resource === 'piggyBanks') {
  // List Piggy Banks
  if (operation === 'listPiggyBanks') {
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;
    const qs: IDataObject = {
      page: paginationOptions.page || 1,
      limit: paginationOptions.limit || 50,
    };

    responseData = await fireflyApiRequest.call(this, 'GET', '/piggy-banks', {}, qs);
    returnData.push(...responseData.data);
  }

  // Get Piggy Bank
  if (operation === 'getPiggyBank') {
    const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;
    responseData = await fireflyApiRequest.call(this, 'GET', `/piggy-banks/${piggyBankId}`);
    returnData.push(responseData);
  }

  // Create Piggy Bank
  if (operation === 'createPiggyBank') {
    const name = this.getNodeParameter('name', i) as string;
    const accountId = this.getNodeParameter('accountId', i) as string;
    const targetAmount = this.getNodeParameter('targetAmount', i) as string;
    const startDate = this.getNodeParameter('startDate', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

    const body: IDataObject = {
      name,
      account_id: accountId,
      target_amount: targetAmount,
      start_date: startDate,
      ...additionalFields,
    };

    // Handle snake_case conversion for additionalFields
    if (additionalFields.currentAmount) {
      body.current_amount = additionalFields.currentAmount;
      delete body.currentAmount;
    }
    if (additionalFields.targetDate) {
      body.target_date = additionalFields.targetDate;
      delete body.targetDate;
    }
    if (additionalFields.objectGroupId) {
      body.object_group_id = additionalFields.objectGroupId;
      delete body.objectGroupId;
    }
    if (additionalFields.objectGroupTitle) {
      body.object_group_title = additionalFields.objectGroupTitle;
      delete body.objectGroupTitle;
    }

    responseData = await fireflyApiRequest.call(this, 'POST', '/piggy-banks', body);
    returnData.push(responseData);
  }

  // Update Piggy Bank
  if (operation === 'updatePiggyBank') {
    const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

    const body: IDataObject = { ...updateFields };

    // Handle snake_case conversion
    if (updateFields.targetAmount) {
      body.target_amount = updateFields.targetAmount;
      delete body.targetAmount;
    }
    if (updateFields.startDate) {
      body.start_date = updateFields.startDate;
      delete body.startDate;
    }
    if (updateFields.targetDate) {
      body.target_date = updateFields.targetDate;
      delete body.targetDate;
    }
    if (updateFields.objectGroupId) {
      body.object_group_id = updateFields.objectGroupId;
      delete body.objectGroupId;
    }
    if (updateFields.objectGroupTitle) {
      body.object_group_title = updateFields.objectGroupTitle;
      delete body.objectGroupTitle;
    }

    responseData = await fireflyApiRequest.call(this, 'PUT', `/piggy-banks/${piggyBankId}`, body);
    returnData.push(responseData);
  }

  // Delete Piggy Bank
  if (operation === 'deletePiggyBank') {
    const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;
    responseData = await fireflyApiRequest.call(this, 'DELETE', `/piggy-banks/${piggyBankId}`);
    returnData.push({ success: true, id: piggyBankId });
  }

  // Get Events
  if (operation === 'getEvents') {
    const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;
    const qs: IDataObject = {
      page: paginationOptions.page || 1,
      limit: paginationOptions.limit || 50,
    };

    responseData = await fireflyApiRequest.call(
      this,
      'GET',
      `/piggy-banks/${piggyBankId}/events`,
      {},
      qs
    );
    returnData.push(...responseData.data);
  }

  // Get Attachments
  if (operation === 'getAttachments') {
    const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;
    const qs: IDataObject = {
      page: paginationOptions.page || 1,
      limit: paginationOptions.limit || 50,
    };

    responseData = await fireflyApiRequest.call(
      this,
      'GET',
      `/piggy-banks/${piggyBankId}/attachments`,
      {},
      qs
    );
    returnData.push(...responseData.data);
  }
}
```

### 4.2 Snake Case Field Mapping

**Firefly III API Expectations** (snake_case):
- `account_id`
- `target_amount`
- `current_amount`
- `start_date`
- `target_date`
- `object_group_id`
- `object_group_title`

**n8n Field Names** (camelCase):
- `accountId`
- `targetAmount`
- `currentAmount`
- `startDate`
- `targetDate`
- `objectGroupId`
- `objectGroupTitle`

**Conversion Pattern**: Explicit field-by-field mapping in execute method (consistent with existing resources).

---

## 5. Integration with Main Node

### 5.1 Fireflyiii.node.ts Changes

**Import Statement** (around line 20):
```typescript
import { piggyBanksOperations, piggyBanksFields } from './actions/piggyBanks/piggyBanks.resource';
```

**Resource Option** (in properties array):
```typescript
{
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  options: [
    // ... existing resources
    {
      name: 'Piggy Banks',
      value: 'piggyBanks',
      description: 'Manage piggy banks and savings goals',
    },
  ],
}
```

**Properties Array Spread** (after resource definition):
```typescript
properties: [
  // ... resource selection
  ...piggyBanksOperations,
  ...piggyBanksFields,
  // ... other resources
]
```

**Execute Method**: Add piggy banks operation handling as shown in section 4.1.

---

## 6. API Response Structures

### 6.1 List Piggy Banks Response

```json
{
  "data": [
    {
      "type": "piggy-banks",
      "id": "1",
      "attributes": {
        "created_at": "2023-01-01T00:00:00+00:00",
        "updated_at": "2023-06-15T12:00:00+00:00",
        "account_id": "3",
        "account_name": "Savings Account",
        "name": "New Camera",
        "currency_id": "1",
        "currency_code": "USD",
        "currency_symbol": "$",
        "currency_decimal_places": 2,
        "target_amount": "1500.00",
        "percentage": 66.67,
        "current_amount": "1000.00",
        "left_to_save": "500.00",
        "save_per_month": "100.00",
        "start_date": "2023-01-01",
        "target_date": "2023-12-31",
        "order": 1,
        "active": true,
        "notes": "Saving for a new DSLR camera",
        "object_group_id": null,
        "object_group_order": null,
        "object_group_title": null
      }
    }
  ],
  "meta": {
    "pagination": {
      "total": 5,
      "count": 5,
      "per_page": 50,
      "current_page": 1,
      "total_pages": 1
    }
  }
}
```

### 6.2 Get Events Response

```json
{
  "data": [
    {
      "type": "piggy-bank-events",
      "id": "1",
      "attributes": {
        "created_at": "2023-06-01T10:00:00+00:00",
        "updated_at": "2023-06-01T10:00:00+00:00",
        "currency_id": "1",
        "currency_code": "USD",
        "currency_symbol": "$",
        "currency_decimal_places": 2,
        "amount": "250.00",
        "transaction_journal_id": "123",
        "transaction_group_id": "456"
      }
    }
  ]
}
```

---

## 7. Special Considerations

### 7.1 Account Association

- Piggy banks MUST be associated with an **asset account** (not expense or revenue)
- The `account_id` field is required during creation
- Firefly III supports multiple accounts per piggy bank through the `accounts` array, but this is an advanced feature
- **Implementation Decision**: Start with single account support via `accountId` field. Multi-account support can be added later if needed.

### 7.2 Events vs Transactions

- **Events** are records of money added/removed from piggy banks
- Events are linked to transactions via `transaction_journal_id` and `transaction_group_id`
- This endpoint is **read-only** - events are created automatically when transactions are associated with piggy banks
- Users cannot manually create/update/delete events through the API

### 7.3 Active Status

- The `active` field is **read-only** in the API
- Firefly III automatically sets this based on the piggy bank's status
- Do NOT include in create/update field definitions

### 7.4 Currency Handling

- Piggy banks inherit currency from the associated account
- `currency_id` and `currency_code` are **read-only** fields
- Users cannot manually set currency during creation/update

### 7.5 Percentage Calculation

- `percentage`, `left_to_save`, and `save_per_month` are **calculated fields**
- These are read-only and computed by Firefly III
- Not included in create/update operations

### 7.6 Date Formats

- All dates use `YYYY-MM-DD` format
- `start_date` is required
- `target_date` is optional (can be null for indefinite savings goals)

---

## 8. Testing Checklist

### 8.1 Basic CRUD Operations
- [ ] List all piggy banks with default pagination
- [ ] List piggy banks with custom pagination (page 2, limit 10)
- [ ] Get single piggy bank by valid ID
- [ ] Get single piggy bank with invalid ID (expect 404)
- [ ] Create piggy bank with required fields only
- [ ] Create piggy bank with all optional fields
- [ ] Create piggy bank with invalid account ID (expect validation error)
- [ ] Update piggy bank - change name
- [ ] Update piggy bank - change target amount
- [ ] Update piggy bank - change target date
- [ ] Update piggy bank - multiple fields simultaneously
- [ ] Delete piggy bank by valid ID
- [ ] Delete piggy bank with invalid ID (expect 404)

### 8.2 Related Resources
- [ ] Get events for piggy bank with events
- [ ] Get events for piggy bank without events (empty array)
- [ ] Get events with pagination
- [ ] Get attachments for piggy bank with attachments
- [ ] Get attachments for piggy bank without attachments (empty array)
- [ ] Get attachments with pagination

### 8.3 Edge Cases
- [ ] Create piggy bank with target amount less than current amount
- [ ] Create piggy bank with target date in the past
- [ ] Create piggy bank with empty name (expect validation error)
- [ ] Create piggy bank with non-numeric target amount (expect validation error)
- [ ] Update piggy bank with empty update fields (no-op)
- [ ] Pagination with page beyond total pages (empty results)

### 8.4 Integration
- [ ] Verify piggy bank appears in account's piggy banks list
- [ ] Verify piggy bank can be associated with object group
- [ ] Verify deleted piggy bank no longer appears in lists
- [ ] Test workflow: Create → Update → Get → Delete

### 8.5 Build & Quality
- [ ] TypeScript compilation succeeds (`pnpm build`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] No type errors in IDE
- [ ] Node appears correctly in n8n UI
- [ ] All operations visible in operation dropdown
- [ ] Field validation works in n8n UI

---

## 9. Implementation Summary

### Files to Create
1. `nodes/FireFlyIII/actions/piggyBanks/piggyBanks.resource.ts` (~400 lines)

### Files to Modify
1. `nodes/FireFlyIII/Fireflyiii.node.ts`
   - Add import statement
   - Add resource option
   - Spread operations and fields
   - Add execute method logic (~100 lines)

### Estimated Complexity
- **Low to Medium** - Similar to Bills/Categories implementation
- **Total Lines**: ~500 new lines
- **Development Time**: 2-3 hours (coding + testing)

### Dependencies
- No new dependencies required
- Uses existing `fireflyApiRequest` utility
- Follows established n8n node patterns

---

## 10. Future Enhancements

### Phase 2 Features (Not in Initial Implementation)
1. **Multi-Account Support**: Support `accounts` array for distributing savings across multiple accounts
2. **Autocomplete Integration**: Add piggy bank autocomplete for easier selection in other operations
3. **Advanced Filtering**: Add filters for active/inactive, by object group, by date range
4. **Bulk Operations**: Support creating/updating multiple piggy banks in single operation
5. **Event Creation**: If Firefly III API adds event creation endpoint in future versions

### Integration Opportunities
- Link piggy banks with transaction creation (already supported via transaction resource)
- Support piggy bank transfers between accounts
- Generate reports on savings progress

---

## 11. API Quirks and Gotchas

### 11.1 Account Type Restrictions
⚠️ **IMPORTANT**: Piggy banks can ONLY be associated with **asset accounts**. Attempting to use expense, revenue, or liability accounts will result in validation errors.

### 11.2 Read-Only Fields
The following fields are computed by Firefly III and should NOT be included in create/update requests:
- `active`
- `currency_id`, `currency_code`, `currency_symbol`, `currency_decimal_places`
- `percentage`
- `left_to_save`
- `save_per_month`
- `account_name`
- `created_at`, `updated_at`

### 11.3 Events Endpoint
- Events are **read-only** through the API
- Events are automatically created when:
  - A transaction is linked to a piggy bank
  - Money is manually added/removed via Firefly III UI
- The API does NOT support creating, updating, or deleting events

### 11.4 Deletion Behavior
- Deleting a piggy bank is permanent and cannot be undone
- All associated events are also deleted
- The associated account remains intact

### 11.5 Pagination Defaults
- Default: 50 items per page
- Maximum: Not specified in API (assume standard limits)
- First page is `page=1` (not 0-indexed)

---

## 12. Documentation Updates

After implementation, update:

1. **CLAUDE.md** - Add Piggy Banks to "Implemented Resources" section:
   ```markdown
   - **Piggy Banks** (`/api/v1/piggy-banks/*`): Full CRUD + events, attachments (7 operations)
   ```

2. **CLAUDE.md** - Remove from "Not Yet Implemented" section:
   ```markdown
   - ~~Piggy Banks (as standalone resource - `/api/v1/piggy-banks/*`)~~
   ```

3. **Create Implementation Summary**: `PIGGY_BANKS_IMPLEMENTATION_SUMMARY.md` following the pattern in Bills implementation summary.

---

## 13. Reference Links

- [Firefly III API Documentation - Piggy Banks](https://api-docs.firefly-iii.org/)
- [Firefly III User Guide - Piggy Banks](https://docs.firefly-iii.org/firefly-iii/financial-concepts/piggy-banks/)
- OpenAPI Specification: `.claude/docs/firefly-iii-6.4.0-v1.yaml` (lines 10494-11000)
- Example Implementation: `.claude/tasks/DESIGN_BILLS_ENDPOINT.md`
- Example Summary: `.claude/tasks/BILLS_IMPLEMENTATION_SUMMARY.md`

---

**Design Complete**: Ready for implementation phase.
