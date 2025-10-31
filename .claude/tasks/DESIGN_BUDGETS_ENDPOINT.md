# Budgets Endpoint Implementation Design

**Target**: Firefly III API v1 (6.4.0) `/api/v1/budgets`  
**Pattern**: Follow existing Bills resource structure  
**Status**: Design Phase

---

## 1. API Endpoint Analysis

### Firefly III Budgets API v1 Operations

Based on Firefly III API documentation and existing patterns:

| Operation | HTTP Method | Endpoint | Description |
|-----------|-------------|----------|-------------|
| **List Budgets** | GET | `/api/v1/budgets` | Retrieve all budgets with optional spent calculation |
| **Get Budget** | GET | `/api/v1/budgets/{id}` | Retrieve single budget by ID with optional spent data |
| **Create Budget** | POST | `/api/v1/budgets` | Create a new budget |
| **Update Budget** | PUT | `/api/v1/budgets/{id}` | Update existing budget |
| **Delete Budget** | DELETE | `/api/v1/budgets/{id}` | Delete a budget |
| **List Budget Limits** | GET | `/api/v1/budgets/{id}/limits` | Get all limits for a specific budget |
| **Create Budget Limit** | POST | `/api/v1/budgets/{id}/limits` | Store new budget limit under this budget |
| **Get Budget Limit** | GET | `/api/v1/budgets/{id}/limits/{limitId}` | Retrieve single budget limit |
| **Update Budget Limit** | PUT | `/api/v1/budgets/{id}/limits/{limitId}` | Update existing budget limit |
| **Delete Budget Limit** | DELETE | `/api/v1/budgets/{id}/limits/{limitId}` | Delete a budget limit |
| **Get Transactions** | GET | `/api/v1/budgets/{id}/transactions` | List transactions for a budget |
| **Get Attachments** | GET | `/api/v1/budgets/{id}/attachments` | List attachments for a budget |
| **Get Limit Transactions** | GET | `/api/v1/budgets/{id}/limits/{limitId}/transactions` | List transactions for a budget limit |
| **List All Budget Limits** | GET | `/api/v1/budget-limits` | Get all budget limits for a date range (across budgets) |
| **Get Transactions Without Budget** | GET | `/api/v1/budgets/transactions-without-budget` | List transactions not assigned to any budget |

### Key Parameters

**Common Parameters:**
- `budgetId` (path parameter) - Budget identifier for budget operations
- `budgetLimitId` (path parameter) - Budget limit identifier for limit operations
- `page`, `limit` (query) - Pagination for list operations
- `start`, `end` (query, YYYY-MM-DD) - Date range filters
- `type` (query) - Transaction type filter: withdrawal, deposit, transfer, all

**Budget Data Fields (Create/Update):**
- `name` (string, required) - Budget name
- `active` (boolean, default: true) - Active status
- `notes` (string) - Additional notes
- `auto_budget_type` (enum) - Type: none, reset, rollover
- `auto_budget_amount` (string/number) - Auto-budget amount
- `auto_budget_currency_id` / `auto_budget_currency_code` (string) - Currency (use one)
- `auto_budget_period` (enum) - Period: daily, weekly, monthly, quarterly, half_year, yearly

**Budget Limit Data Fields (Create/Update):**
- `amount` (string, required) - Limit amount
- `start` (date, required) - Start date (YYYY-MM-DD)
- `end` (date, required) - End date (YYYY-MM-DD)
- `budget_id` (string, required) - Budget ID (must match path parameter)

---

## 2. File Structure Design

Following the established pattern in `nodes/FireFlyIII/actions/`:

```
nodes/FireFlyIII/actions/budgets/
└── budgets.resource.ts          # Main operations and fields export
```

**Decision**: Single `budgets.resource.ts` file following Bills pattern.

---

## 3. budgets.resource.ts Structure

### 3.1 Operations Definition

```typescript
export const budgetsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['budgets'],
      },
    },
    options: [
      {
        name: 'List Budgets',
        value: 'listBudgets',
        description: 'Retrieve all budgets',
        action: 'List budgets',
      },
      {
        name: 'Get Budget',
        value: 'getBudget',
        description: 'Retrieve a single budget',
        action: 'Get budget',
      },
      {
        name: 'Create Budget',
        value: 'createBudget',
        description: 'Create a new budget',
        action: 'Create budget',
      },
      {
        name: 'Update Budget',
        value: 'updateBudget',
        description: 'Update an existing budget',
        action: 'Update budget',
      },
      {
        name: 'Delete Budget',
        value: 'deleteBudget',
        description: 'Delete a budget',
        action: 'Delete budget',
      },
      {
        name: 'List Budget Limits',
        value: 'listBudgetLimits',
        description: 'Get all limits for a budget',
        action: 'List budget limits',
      },
      {
        name: 'Create Budget Limit',
        value: 'createBudgetLimit',
        description: 'Store new budget limit',
        action: 'Create budget limit',
      },
      {
        name: 'Get Budget Limit',
        value: 'getBudgetLimit',
        description: 'Retrieve a single budget limit',
        action: 'Get budget limit',
      },
      {
        name: 'Update Budget Limit',
        value: 'updateBudgetLimit',
        description: 'Update an existing budget limit',
        action: 'Update budget limit',
      },
      {
        name: 'Delete Budget Limit',
        value: 'deleteBudgetLimit',
        description: 'Delete a budget limit',
        action: 'Delete budget limit',
      },
      {
        name: 'Get Transactions',
        value: 'getTransactions',
        description: 'List transactions for a budget',
        action: 'Get budget transactions',
      },
      {
        name: 'Get Attachments',
        value: 'getAttachments',
        description: 'Retrieve attachments for a budget',
        action: 'Get budget attachments',
      },
      {
        name: 'Get Limit Transactions',
        value: 'getLimitTransactions',
        description: 'List transactions for a budget limit',
        action: 'Get budget limit transactions',
      },
      {
        name: 'List All Budget Limits',
        value: 'listAllBudgetLimits',
        description: 'Get all budget limits for a date range',
        action: 'List all budget limits',
      },
      {
        name: 'Get Transactions Without Budget',
        value: 'getTransactionsWithoutBudget',
        description: 'List transactions not assigned to any budget',
        action: 'Get transactions without budget',
      },
    ],
    default: 'listBudgets',
  },
];
```

### 3.2 Field Definitions

#### Shared Fields
- **Budget ID**: Required for 11 operations (getBudget, updateBudget, deleteBudget, all limit operations, getTransactions, getAttachments, getLimitTransactions)
- **Budget Limit ID**: Required for 4 operations (getBudgetLimit, updateBudgetLimit, deleteBudgetLimit, getLimitTransactions)
- **Pagination Options**: Collection with limit, page (for list operations)
- **Date Range Filters**: Collection with start, end dates (YYYY-MM-DD format)
- **Transaction Type**: Dropdown with all, withdrawal, deposit, transfer

#### Budget CRUD Fields
- **Create Budget**: 
  - Required: name (string)
  - Optional Collection (budgetFields): active, notes, auto_budget_type, auto_budget_amount, auto_budget_currency_code, auto_budget_currency_id, auto_budget_period
- **Update Budget**: 
  - Optional Collection (updateFields): name, active, notes, auto_budget_type, auto_budget_amount, auto_budget_currency_code, auto_budget_currency_id, auto_budget_period

#### Budget Limit Fields
- **Create Budget Limit**:
  - Required: amount, start, end
  - Note: budget_id must be included in body despite being in path parameter
  - Optional Collection (budgetLimitFields): any additional fields
- **Update Budget Limit**:
  - Optional Collection (updateLimitFields): amount, start, end

---

## 4. Execute Method Implementation

Add to `Fireflyiii.node.ts` execute() method following Bills pattern:

```typescript
// ----------------------------------
//         Budgets API
// ----------------------------------
else if (resource === 'budgets') {
  // Budget CRUD Operations
  if (operation === 'listBudgets') {
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: '/budgets',
      query: { ...paginationOptions, ...dateRangeFilters },
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'getBudget') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/budgets/${budgetId}`,
      query: { ...dateRangeFilters },
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'createBudget') {
    const name = this.getNodeParameter('name', i) as string;
    const budgetFields = this.getNodeParameter('budgetFields', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'POST',
      endpoint: '/budgets',
      body: { name, ...budgetFields },
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'updateBudget') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'PUT',
      endpoint: `/budgets/${budgetId}`,
      body: updateFields,
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'deleteBudget') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'DELETE',
      endpoint: `/budgets/${budgetId}`,
    });
    returnData.push({ json: response });
  }
  
  // Budget Limit Operations
  else if (operation === 'listBudgetLimits') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/budgets/${budgetId}/limits`,
      query: { ...dateRangeFilters },
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'createBudgetLimit') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const amount = this.getNodeParameter('amount', i) as string;
    const start = this.getNodeParameter('start', i) as string;
    const end = this.getNodeParameter('end', i) as string;
    const budgetLimitFields = this.getNodeParameter('budgetLimitFields', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'POST',
      endpoint: `/budgets/${budgetId}/limits`,
      body: { 
        amount, 
        start, 
        end, 
        budget_id: budgetId,  // Required in body despite being in path
        ...budgetLimitFields 
      },
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'getBudgetLimit') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const budgetLimitId = this.getNodeParameter('budgetLimitId', i) as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/budgets/${budgetId}/limits/${budgetLimitId}`,
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'updateBudgetLimit') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const budgetLimitId = this.getNodeParameter('budgetLimitId', i) as string;
    const updateLimitFields = this.getNodeParameter('updateLimitFields', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'PUT',
      endpoint: `/budgets/${budgetId}/limits/${budgetLimitId}`,
      body: updateLimitFields,
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'deleteBudgetLimit') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const budgetLimitId = this.getNodeParameter('budgetLimitId', i) as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'DELETE',
      endpoint: `/budgets/${budgetId}/limits/${budgetLimitId}`,
    });
    returnData.push({ json: response });
  }
  
  // Additional Operations
  else if (operation === 'getTransactions') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
    const transactionType = this.getNodeParameter('transactionType', i, 'all') as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/budgets/${budgetId}/transactions`,
      query: {
        ...paginationOptions,
        ...dateRangeFilters,
        type: transactionType === 'all' ? undefined : transactionType,
      },
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'getAttachments') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/budgets/${budgetId}/attachments`,
      query: { ...paginationOptions },
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'getLimitTransactions') {
    const budgetId = this.getNodeParameter('budgetId', i) as string;
    const budgetLimitId = this.getNodeParameter('budgetLimitId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
    const transactionType = this.getNodeParameter('transactionType', i, 'all') as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/budgets/${budgetId}/limits/${budgetLimitId}/transactions`,
      query: {
        ...paginationOptions,
        ...dateRangeFilters,
        type: transactionType === 'all' ? undefined : transactionType,
      },
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'listAllBudgetLimits') {
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
    
    // Validate required fields
    if (!dateRangeFilters.start || !dateRangeFilters.end) {
      throw new NodeOperationError(
        this.getNode(),
        'Start and end dates are required for listAllBudgetLimits operation',
      );
    }

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: '/budget-limits',
      query: { ...dateRangeFilters },
    });
    returnData.push({ json: response });
  }
  
  else if (operation === 'getTransactionsWithoutBudget') {
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
    const transactionType = this.getNodeParameter('transactionType', i, 'all') as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: '/budgets/transactions-without-budget',
      query: {
        ...paginationOptions,
        ...dateRangeFilters,
        type: transactionType === 'all' ? undefined : transactionType,
      },
    });
    returnData.push({ json: response });
  }
}
```

---

## 5. Integration Points

### 5.1 Main Node File Updates

**Add to resource dropdown** (in Fireflyiii.node.ts properties):
```typescript
{
  name: 'Budgets API',
  value: 'budgets',
  description: "Endpoints deliver all of the user's budgets, budget limits, and CRUD operations",
},
```

**Add imports**:
```typescript
import { budgetsOperations, budgetsFields } from './actions/budgets/budgets.resource';
import { NodeOperationError } from 'n8n-workflow';  // For error handling
```

**Spread operations and fields**:
```typescript
properties: [
  // ... existing resources
  ...budgetsOperations,
  // ... other operations
  ...budgetsFields,
  // ... other fields
]
```

---

## 6. Special Considerations

### 6.1 API Quirks
1. **Budget Limit Creation**: The `budget_id` must be included in the request body even though it's in the path parameter
2. **Date Validation**: `listAllBudgetLimits` operation requires start and end dates - implement validation
3. **Transaction Type**: Pass `undefined` instead of "all" string when filtering all transaction types
4. **Currency Fields**: Users should use either `currency_id` OR `currency_code`, not both

### 6.2 Field Alphabetization
ESLint rule `node-param-collection-type-unsorted-items` requires collection options to be alphabetically sorted by `displayName`. Ensure:
- Active
- Auto Budget Amount
- Auto Budget Currency Code
- Auto Budget Currency ID
- Auto Budget Period
- Auto Budget Type
- Notes

---

## 7. Testing Checklist

### Budget CRUD
- [ ] List budgets without date range
- [ ] List budgets with spent calculation (date range)
- [ ] Get single budget with spent data
- [ ] Create budget with required fields only
- [ ] Create budget with auto-budget fields
- [ ] Update budget
- [ ] Delete budget

### Budget Limits
- [ ] List budget limits for a budget
- [ ] Create budget limit (verify budget_id in body works)
- [ ] Get budget limit
- [ ] Update budget limit
- [ ] Delete budget limit
- [ ] List all budget limits with date range (validate required dates)

### Additional Operations
- [ ] Get transactions for budget
- [ ] Get transactions for budget limit
- [ ] Get attachments for budget
- [ ] Get transactions without budget
- [ ] Verify transaction type filtering
- [ ] Verify pagination

### Error Handling
- [ ] Invalid budget ID
- [ ] Invalid budget limit ID
- [ ] Missing required dates for listAllBudgetLimits

---

## 8. Documentation References

- **Firefly III API Docs**: https://api-docs.firefly-iii.org/#/budgets
- **Budget Management Guide**: https://docs.firefly-iii.org/how-to/firefly-iii/features/budgets/

---

**End of Design Document**
