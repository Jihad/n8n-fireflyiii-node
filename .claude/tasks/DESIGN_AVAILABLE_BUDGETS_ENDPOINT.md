# Available Budgets Endpoint Implementation Design

**Target**: Firefly III API v1 (6.4.0) `/api/v1/available-budgets`  
**Pattern**: Follow existing resource structure (objectGroups, accounts, categories)  
**Status**: Design Phase

---

## 1. API Endpoint Analysis

### Firefly III Available Budgets API v1 Operations

Available Budgets in Firefly III represent the total amount of money budgeted across periods. This is a **read-only resource** that Firefly III calculates automatically - users cannot create, update, or delete available budgets directly.

| Operation | HTTP Method | Endpoint | Description |
|-----------|-------------|----------|-------------|
| **List Available Budgets** | GET | `/api/v1/available-budgets` | Retrieve all available budget amounts with pagination and date filters |
| **Get Available Budget** | GET | `/api/v1/available-budgets/{id}` | Retrieve single available budget by ID |

**Note**: There are **NO** create, update, or delete operations for available budgets. They are automatically calculated by Firefly III based on budget data.

### Key Parameters

**Common Parameters:**
- `id` (path parameter) - Available budget identifier for single-budget operations
- `page`, `limit` (query) - Pagination for list operations
- `start`, `end` (query, YYYY-MM-DD) - Date range filters for list operation

**Available Budget Data Fields (Read-Only):**
- `amount` (string) - The amount in the budget's currency
- `pc_amount` (string) - The amount in primary currency
- `start` (datetime) - Start date of the available budget period
- `end` (datetime) - End date of the available budget period
- `currency_id`, `currency_code`, `currency_symbol` - Currency information
- `spent_in_budgets` (array) - Amount spent within budgets
- `spent_outside_budgets` (array) - Amount spent outside budgets
- All fields prefixed with `pc_` are in primary currency

**Read-Only Fields (System Generated):**
- `created_at`, `updated_at` - Timestamps
- `primary_currency_*` - Administration's primary currency details
- All spending arrays and calculations

---

## 2. File Structure Design

Following the established pattern in `nodes/FireFlyIII/actions/`:

```
nodes/FireFlyIII/actions/availableBudgets/
└── availableBudgets.resource.ts       # All operations and fields in single file
```

**Decision**: Single file implementation. Available budgets have only 2 read-only operations, making this the simplest resource implementation.

---

## 3. availableBudgets.resource.ts Structure

### 3.1 Operations Definition

```typescript
import type { INodeProperties } from 'n8n-workflow';

export const availableBudgetsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['availableBudgets'],
      },
    },
    options: [
      {
        name: 'Get Available Budget',
        value: 'getAvailableBudget',
        description: 'Retrieve a single available budget',
        action: 'Get available budget',
      },
      {
        name: 'List Available Budgets',
        value: 'listAvailableBudgets',
        description: 'Retrieve all available budgets',
        action: 'List available budgets',
      },
    ],
    default: 'listAvailableBudgets',
  },
];
```

### 3.2 Field Definitions Structure

```typescript
export const availableBudgetsFields: INodeProperties[] = [
  // ----------------------------------
  //     Available Budget ID Field
  // ----------------------------------
  {
    displayName: 'Available Budget ID',
    name: 'availableBudgetId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['availableBudgets'],
        operation: ['getAvailableBudget'],
      },
    },
    description: 'The ID of the available budget',
  },

  // ----------------------------------
  //     READ-ONLY NOTICE
  // ----------------------------------
  {
    displayName: 'Available budgets are read-only',
    name: 'readOnlyNotice',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['availableBudgets'],
        operation: ['listAvailableBudgets'],
      },
    },
    description:
      'Available budgets are automatically calculated by Firefly III and cannot be created, updated, or deleted directly',
  },

  // ----------------------------------
  //     DATE RANGE FILTERS
  // ----------------------------------
  {
    displayName: 'Date Range Filters',
    name: 'dateRangeFilters',
    type: 'collection',
    placeholder: 'Add Date Range',
    default: {},
    displayOptions: {
      show: {
        resource: ['availableBudgets'],
        operation: ['listAvailableBudgets'],
      },
    },
    options: [
      {
        displayName: 'Start Date',
        name: 'start',
        type: 'string',
        default: '',
        description: 'Start date (YYYY-MM-DD)',
        placeholder: '2025-01-01',
      },
      {
        displayName: 'End Date',
        name: 'end',
        type: 'string',
        default: '',
        description: 'End date (YYYY-MM-DD)',
        placeholder: '2025-12-31',
      },
    ],
  },

  // ----------------------------------
  //     PAGINATION OPTIONS
  // ----------------------------------
  {
    displayName: 'Pagination Options',
    name: 'paginationOptions',
    type: 'collection',
    placeholder: 'Add Pagination Options',
    default: {},
    displayOptions: {
      show: {
        resource: ['availableBudgets'],
        operation: ['listAvailableBudgets'],
      },
    },
    options: [
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1,
        },
        default: 50,
        description: 'Max number of results to return',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        typeOptions: {
          minValue: 1,
        },
        default: 1,
        description: 'The page number to retrieve',
      },
    ],
  },
];
```

---

## 4. Integration into Main Node

### 4.1 Import in Fireflyiii.node.ts

Add to imports section (around line 30-50):

```typescript
import {
  availableBudgetsOperations,
  availableBudgetsFields,
} from './actions/availableBudgets/availableBudgets.resource';
```

### 4.2 Add to Description Property

In the `description` property of `Fireflyiii` class (around line 90-100), add availableBudgets to resource options:

```typescript
{
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    { name: 'About', value: 'about' },
    { name: 'Accounts', value: 'accounts' },
    { name: 'Available Budgets', value: 'availableBudgets' },  // ADD THIS
    { name: 'Bills', value: 'bills' },
    // ... rest of resources
  ],
  default: 'transactions',
},
```

### 4.3 Spread Operations and Fields

Add to properties array (around line 195):

```typescript
properties: [
  // ... existing properties
  ...availableBudgetsOperations,
  ...availableBudgetsFields,
  // ... rest of properties
],
```

---

## 5. Execute Method Implementation

Add availableBudgets block in `execute()` method (after objectGroups block, around line 1620-1650):

```typescript
// ----------------------------------
//       Available Budgets API
// ----------------------------------
else if (resource === 'availableBudgets') {
  if (operation === 'listAvailableBudgets') {
    const paginationOptions = this.getNodeParameter(
      'paginationOptions',
      i,
      {},
    ) as IDataObject;
    const dateRangeFilters = this.getNodeParameter(
      'dateRangeFilters',
      i,
      {},
    ) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: '/available-budgets',
      query: {
        ...paginationOptions,
        ...dateRangeFilters,
      },
    });

    returnData.push({ json: response });
  } 
  
  else if (operation === 'getAvailableBudget') {
    const availableBudgetId = this.getNodeParameter('availableBudgetId', i) as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/available-budgets/${availableBudgetId}`,
    });

    returnData.push({ json: response });
  }
}
```

---

## 6. Implementation Checklist

### Phase 1: File Creation
- [ ] Create `nodes/FireFlyIII/actions/availableBudgets/` directory
- [ ] Create `availableBudgets.resource.ts` with operations and fields
- [ ] Verify TypeScript compilation: `pnpm build`
- [ ] Fix any linting issues: `pnpm lintfix`

### Phase 2: Integration
- [ ] Import availableBudgets operations and fields in `Fireflyiii.node.ts`
- [ ] Add 'Available Budgets' to resource dropdown options
- [ ] Spread `...availableBudgetsOperations` and `...availableBudgetsFields` in properties

### Phase 3: Execute Method
- [ ] Add availableBudgets resource block in `execute()` method
- [ ] Implement both operations (listAvailableBudgets, getAvailableBudget)
- [ ] Verify query parameter passing
- [ ] Build and test compilation: `pnpm build`

### Phase 4: Testing
- [ ] Test with live Firefly III instance:
  - [ ] List Available Budgets (with and without date filters)
  - [ ] List Available Budgets (with pagination)
  - [ ] Get Available Budget (single budget retrieval)
  - [ ] Verify read-only notice displays correctly

### Phase 5: Documentation
- [ ] Update README.md to include available budgets endpoint
- [ ] Update CLAUDE.md with available budgets implementation notes
- [ ] Document the read-only nature and automatic calculation

---

## 7. Testing Strategy

### Test Cases

**TC-001: List Available Budgets**
- Input: No filters, default pagination
- Expected: JSON response with available budgets array
- Validation: Response structure matches Firefly III schema

**TC-002: Date Range Filter**
- Input: listAvailableBudgets with start="2025-01-01", end="2025-12-31"
- Expected: Only available budgets within date range
- Validation: All returned budgets have start/end within range

**TC-003: Get Available Budget**
- Input: availableBudgetId from TC-001
- Expected: 200 OK with available budget details
- Validation: Returns amount, dates, currency info, spending arrays

**TC-004: Pagination**
- Input: listAvailableBudgets with limit=10, page=1
- Expected: First 10 results returned
- Validation: Pagination metadata present

**TC-005: Read-Only Notice**
- Input: Select availableBudgets resource, listAvailableBudgets operation
- Expected: Notice field displayed in UI
- Validation: User informed about read-only nature

### Error Cases

**EC-001: Invalid Available Budget ID**
- Input: getAvailableBudget with availableBudgetId="99999"
- Expected: 404 Not Found
- Handling: n8n displays error to user

**EC-002: Invalid Date Format**
- Input: Invalid date format "15-01-2025"
- Expected: API validation error
- Handling: Field description clarifies YYYY-MM-DD format

---

## 8. Special Considerations

### Read-Only Resource
**Critical**: Available budgets are **read-only**. They are:
- Automatically calculated by Firefly III
- Based on budget data and transactions
- Cannot be created, updated, or deleted via API
- Represent periods and amounts Firefly III tracks

The implementation includes a `notice` field to inform users about this behavior.

### Data Structure Complexity
Available budgets contain:
- **Amount fields**: Both in budget currency and primary currency (`amount` vs `pc_amount`)
- **Spending arrays**: Complex nested structures for spent amounts
- **Currency details**: Multiple currency-related fields
- **Read-only calculations**: All spending and balance calculations

Users receive the complete data structure but cannot modify it.

### Date Range Filtering
- Optional `start` and `end` query parameters
- Filter by budget period dates
- Format: `YYYY-MM-DD`
- Firefly III returns budgets overlapping the range

### Minimal Operations
This is one of the simplest resources:
- Only 2 operations (List and Get)
- No parameters for create/update/delete
- Pure data retrieval

---

## 9. Implementation Estimate

**Effort**: ~1.5-2 hours

| Task | Estimated Time |
|------|---------------|
| File creation and field definitions | 30 minutes |
| Integration into main node | 15 minutes |
| Execute method implementation | 30 minutes |
| Testing with live instance | 30 minutes |
| Documentation updates | 15 minutes |

**Complexity**: Low
- Only 2 read-only operations
- No data validation or transformation needed
- Standard pagination and filtering
- No create/update/delete complexity

---

## 10. Documentation Updates Required

### CLAUDE.md Additions

Add to the "Implemented Resources" section:

```markdown
- **Available Budgets** (`/api/v1/available-budgets/*`): Read-only resource (2 operations)
  - List and Get available budget amounts
  - **Note**: Available budgets are automatically calculated by Firefly III and cannot be modified
```

Add to "API Gotchas" section:

```markdown
### Available Budgets Are Read-Only
Available budgets cannot be created, updated, or deleted through the API:
- Firefly III calculates them automatically based on budget data
- They represent periods and total amounts budgeted
- Only List and Get operations are available
- Contains spending calculations in both budget and primary currency
```

### README.md Additions

Add to features list:
```markdown
- **Available Budgets**: List and retrieve calculated available budget amounts (read-only)
```

---

## 11. Future Enhancements

### Possible Additions (Not in Initial Implementation)
- [ ] **Currency Filtering**: Filter by specific currency (Firefly III has `/currencies/{code}/available-budgets`)
- [ ] **Spending Analysis**: Parse spending arrays for visualization
- [ ] **Budget Comparison**: Compare available vs spent amounts
- [ ] **Period Grouping**: Group by time periods (monthly, quarterly)

### API Coverage Considerations
- Available budgets are feature-complete for direct v1 API
- Currency-based filtering endpoint exists but not initially implemented
- No additional v2 endpoints for available budgets

---

## 12. Related Operations

### Viewing Available Budget Data

**Via Available Budgets API:**
```typescript
// List all available budgets with date range
{
  operation: "listAvailableBudgets",
  dateRangeFilters: {
    start: "2025-01-01",
    end: "2025-12-31"
  }
}

// Response includes:
// - amount (in budget currency)
// - pc_amount (in primary currency)
// - spent_in_budgets
// - spent_outside_budgets
// - start/end dates
```

### Integration Points
1. **Budgets Resource**: Available budgets show aggregated data from regular budgets
2. **Transactions**: Spending calculations include all relevant transactions
3. **Currencies**: Available budgets track amounts in multiple currencies

### Understanding Available Budgets
```
Available Budget = Total amount set aside for a period
├─ amount: Amount in budget's currency
├─ pc_amount: Amount in primary currency
├─ spent_in_budgets: Money spent within defined budgets
├─ spent_outside_budgets: Money spent outside budgets
└─ Period: start → end dates
```

---

## References

- [Firefly III API Documentation](https://api-docs.firefly-iii.org/)
- [Firefly III Available Budgets Tag](https://api-docs.firefly-iii.org/?urls.primaryName=2.1.0%20(v1)#/available_budgets)
- OpenAPI Spec: `.claude/docs/firefly-iii-6.4.0-v1.yaml` lines 5943-6092
- Existing patterns: `nodes/FireFlyIII/actions/objectGroups/objectGroups.resource.ts`
- Existing patterns: `nodes/FireFlyIII/actions/accounts/accounts.resource.ts`

---

## Appendix: API Response Examples

### List Available Budgets Response
```json
{
  "data": [
    {
      "type": "available_budgets",
      "id": "1",
      "attributes": {
        "created_at": "2025-01-01T00:00:00+00:00",
        "updated_at": "2025-01-15T00:00:00+00:00",
        "currency_id": "1",
        "currency_code": "USD",
        "currency_symbol": "$",
        "amount": "5000.00",
        "pc_amount": "5000.00",
        "start": "2025-01-01T00:00:00+00:00",
        "end": "2025-01-31T23:59:59+00:00",
        "spent_in_budgets": [
          {
            "currency_id": "1",
            "currency_code": "USD",
            "sum": "3500.00"
          }
        ],
        "spent_outside_budgets": [
          {
            "currency_id": "1",
            "currency_code": "USD",
            "sum": "200.00"
          }
        ]
      }
    }
  ],
  "meta": {
    "pagination": {
      "total": 12,
      "count": 1,
      "per_page": 50,
      "current_page": 1,
      "total_pages": 1
    }
  }
}
```

### Get Available Budget Response
```json
{
  "data": {
    "type": "available_budgets",
    "id": "1",
    "attributes": {
      "created_at": "2025-01-01T00:00:00+00:00",
      "updated_at": "2025-01-15T00:00:00+00:00",
      "currency_id": "1",
      "currency_code": "USD",
      "currency_symbol": "$",
      "currency_decimal_places": 2,
      "primary_currency_id": "1",
      "primary_currency_code": "USD",
      "primary_currency_symbol": "$",
      "primary_currency_decimal_places": 2,
      "amount": "5000.00",
      "pc_amount": "5000.00",
      "start": "2025-01-01T00:00:00+00:00",
      "end": "2025-01-31T23:59:59+00:00",
      "spent_in_budgets": [],
      "pc_spent_in_budgets": [],
      "spent_outside_budgets": [],
      "pc_spent_outside_budgets": []
    }
  }
}
```
