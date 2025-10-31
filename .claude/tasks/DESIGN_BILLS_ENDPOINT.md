# Bills Endpoint Implementation Design

**Target**: Firefly III API v1 (6.4.0) `/api/v1/bills`  
**Pattern**: Follow existing resource structure (accounts, transactions, categories)  
**Status**: Design Phase

---

## 1. API Endpoint Analysis

### Firefly III Bills API v1 Operations

Based on Firefly III API documentation and existing patterns:

| Operation | HTTP Method | Endpoint | Description |
|-----------|-------------|----------|-------------|
| **List Bills** | GET | `/api/v1/bills` | Retrieve all bills with pagination |
| **Get Bill** | GET | `/api/v1/bills/{id}` | Retrieve single bill by ID |
| **Create Bill** | POST | `/api/v1/bills` | Create a new bill |
| **Update Bill** | PUT | `/api/v1/bills/{id}` | Update existing bill |
| **Delete Bill** | DELETE | `/api/v1/bills/{id}` | Delete a bill |
| **Get Bill Attachments** | GET | `/api/v1/bills/{id}/attachments` | List attachments for a bill |
| **Get Bill Rules** | GET | `/api/v1/bills/{id}/rules` | List rules associated with bill |
| **Get Bill Transactions** | GET | `/api/v1/bills/{id}/transactions` | List transactions for bill within date range |

### Key Parameters

**Common Parameters:**
- `billId` (path parameter) - Bill identifier for single-bill operations
- `page`, `limit` (query) - Pagination for list operations
- `start`, `end` (query, YYYY-MM-DD) - Date range filters

**Bill Data Fields (Create/Update):**
- `name` (string, required) - Bill name
- `amount_min` (string/number, required) - Minimum expected amount
- `amount_max` (string/number, required) - Maximum expected amount
- `date` (date, required) - Expected bill date (YYYY-MM-DD)
- `repeat_freq` (string) - Frequency: weekly, monthly, quarterly, half-year, yearly
- `skip` (integer, default: 0) - Number of periods to skip
- `active` (boolean, default: true) - Active status
- `currency_id` / `currency_code` (string) - Currency
- `notes` (string) - Additional notes
- `object_group_id` / `object_group_title` (string) - Object group association

---

## 2. File Structure Design

Following the established pattern in `nodes/FireFlyIII/actions/`:

```
nodes/FireFlyIII/actions/bills/
├── bills.resource.ts          # Main operations and fields export
└── createBill.fields.ts       # Reusable bill data fields (optional)
```

**Decision**: Start with single `bills.resource.ts` file. Extract to `createBill.fields.ts` only if field definitions exceed ~200 lines (same pattern as transactions).

---

## 3. bills.resource.ts Structure

### 3.1 Operations Definition

```typescript
export const billsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['bills'],
      },
    },
    options: [
      {
        name: 'List Bills',
        value: 'listBills',
        description: 'Retrieve all bills',
        action: 'List bills',
      },
      {
        name: 'Get Bill',
        value: 'getBill',
        description: 'Retrieve a single bill',
        action: 'Get bill',
      },
      {
        name: 'Create Bill',
        value: 'createBill',
        description: 'Create a new bill',
        action: 'Create bill',
      },
      {
        name: 'Update Bill',
        value: 'updateBill',
        description: 'Update an existing bill',
        action: 'Update bill',
      },
      {
        name: 'Delete Bill',
        value: 'deleteBill',
        description: 'Delete a bill',
        action: 'Delete bill',
      },
      {
        name: 'Get Attachments',
        value: 'getAttachments',
        description: 'Retrieve attachments for a bill',
        action: 'Get bill attachments',
      },
      {
        name: 'Get Rules',
        value: 'getRules',
        description: 'Retrieve rules associated with a bill',
        action: 'Get bill rules',
      },
      {
        name: 'Get Transactions',
        value: 'getTransactions',
        description: 'List transactions for a bill',
        action: 'Get bill transactions',
      },
      // API v2 operations
      {
        name: 'Sum Paid Bills',
        value: 'sumPaid',
        description: 'Get sum of paid bills in date range',
        action: 'Sum paid bills',
      },
      {
        name: 'Sum Unpaid Bills',
        value: 'sumUnpaid',
        description: 'Get sum of unpaid bills in date range',
        action: 'Sum unpaid bills',
      },
    ],
    default: 'listBills',
  },
];
```

### 3.2 Field Definitions Structure

```typescript
export const billsFields: INodeProperties[] = [
  // ----------------------------------
  //       Shared Bill ID Field
  // ----------------------------------
  {
    displayName: 'Bill ID',
    name: 'billId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: [
          'getBill',
          'updateBill',
          'deleteBill',
          'getAttachments',
          'getRules',
          'getTransactions',
        ],
      },
    },
    description: 'The ID of the bill',
  },

  // ----------------------------------
  //      CREATE BILL FIELDS
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: ['createBill'],
      },
    },
    description: 'The name of the bill',
  },
  {
    displayName: 'Minimum Amount',
    name: 'amount_min',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: ['createBill'],
      },
    },
    description: 'Minimum expected amount',
  },
  {
    displayName: 'Maximum Amount',
    name: 'amount_max',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: ['createBill'],
      },
    },
    description: 'Maximum expected amount',
  },
  {
    displayName: 'Date',
    name: 'date',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: ['createBill'],
      },
    },
    description: 'Expected bill date (YYYY-MM-DD)',
    placeholder: '2025-01-15',
  },
  {
    displayName: 'Repeat Frequency',
    name: 'repeat_freq',
    type: 'options',
    options: [
      { name: 'Weekly', value: 'weekly' },
      { name: 'Monthly', value: 'monthly' },
      { name: 'Quarterly', value: 'quarterly' },
      { name: 'Half Year', value: 'half-year' },
      { name: 'Yearly', value: 'yearly' },
    ],
    default: 'monthly',
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: ['createBill'],
      },
    },
    description: 'How often the bill repeats',
  },

  // Additional Optional Fields Collection
  {
    displayName: 'Additional Bill Fields',
    name: 'billFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: ['createBill'],
      },
    },
    options: [
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the bill is active',
      },
      {
        displayName: 'Skip',
        name: 'skip',
        type: 'number',
        default: 0,
        description: 'Number of periods to skip',
      },
      {
        displayName: 'Currency ID',
        name: 'currency_id',
        type: 'string',
        default: '',
        description: 'Currency ID',
      },
      {
        displayName: 'Currency Code',
        name: 'currency_code',
        type: 'string',
        default: '',
        description: 'Currency code (e.g., USD, EUR)',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Additional notes',
      },
      {
        displayName: 'Object Group ID',
        name: 'object_group_id',
        type: 'string',
        default: '',
        description: 'Object group ID',
      },
      {
        displayName: 'Object Group Title',
        name: 'object_group_title',
        type: 'string',
        default: '',
        description: 'Object group title',
      },
    ],
  },

  // ----------------------------------
  //      UPDATE BILL FIELDS
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: ['updateBill'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the bill',
      },
      {
        displayName: 'Minimum Amount',
        name: 'amount_min',
        type: 'number',
        default: 0,
        description: 'Minimum expected amount',
      },
      {
        displayName: 'Maximum Amount',
        name: 'amount_max',
        type: 'number',
        default: 0,
        description: 'Maximum expected amount',
      },
      {
        displayName: 'Date',
        name: 'date',
        type: 'string',
        default: '',
        description: 'Expected bill date (YYYY-MM-DD)',
        placeholder: '2025-01-15',
      },
      {
        displayName: 'Repeat Frequency',
        name: 'repeat_freq',
        type: 'options',
        options: [
          { name: 'Weekly', value: 'weekly' },
          { name: 'Monthly', value: 'monthly' },
          { name: 'Quarterly', value: 'quarterly' },
          { name: 'Half Year', value: 'half-year' },
          { name: 'Yearly', value: 'yearly' },
        ],
        default: 'monthly',
        description: 'How often the bill repeats',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the bill is active',
      },
      {
        displayName: 'Skip',
        name: 'skip',
        type: 'number',
        default: 0,
        description: 'Number of periods to skip',
      },
      {
        displayName: 'Currency ID',
        name: 'currency_id',
        type: 'string',
        default: '',
        description: 'Currency ID',
      },
      {
        displayName: 'Currency Code',
        name: 'currency_code',
        type: 'string',
        default: '',
        description: 'Currency code (e.g., USD, EUR)',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Additional notes',
      },
      {
        displayName: 'Object Group ID',
        name: 'object_group_id',
        type: 'string',
        default: '',
        description: 'Object group ID',
      },
      {
        displayName: 'Object Group Title',
        name: 'object_group_title',
        type: 'string',
        default: '',
        description: 'Object group title',
      },
    ],
  },

  // ----------------------------------
  //      DATE RANGE FILTERS
  // ----------------------------------
  {
    displayName: 'Date Range Filters',
    name: 'dateRangeFilters',
    type: 'collection',
    placeholder: 'Add Date Range',
    default: {},
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: ['listBills', 'getTransactions', 'sumPaid', 'sumUnpaid'],
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
  //      PAGINATION OPTIONS
  // ----------------------------------
  {
    displayName: 'Pagination Options',
    name: 'paginationOptions',
    type: 'collection',
    placeholder: 'Add Pagination Options',
    default: {},
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: [
          'listBills',
          'getAttachments',
          'getRules',
          'getTransactions',
        ],
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

  // ----------------------------------
  //      NOTICE FOR v2 OPERATIONS
  // ----------------------------------
  {
    displayName: 'Date range required (start and end)',
    name: 'sumNotice',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['bills'],
        operation: ['sumPaid', 'sumUnpaid'],
      },
    },
  },
];
```

---

## 4. Integration into Main Node

### 4.1 Import in Fireflyiii.node.ts

Add to imports section around line 30-40:

```typescript
import {
  billsOperations,
  billsFields,
} from './actions/bills/bills.resource';
```

### 4.2 Add to Description Property

In the `description` property of `Fireflyiii` class (around line 90-100), add bills to resource options:

```typescript
{
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    { name: 'About', value: 'about' },
    { name: 'Accounts', value: 'accounts' },
    { name: 'Bills', value: 'bills' },  // ADD THIS
    { name: 'Categories', value: 'categories' },
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
  ...billsOperations,
  ...billsFields,
  // ... rest of properties
],
```

---

## 5. Execute Method Implementation

Add bills block in `execute()` method (around line 600-650, after rules block):

```typescript
// ----------------------------------
//             Bills API
// ----------------------------------
else if (resource === 'bills') {
  if (operation === 'listBills') {
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: '/bills',
      query: {
        ...paginationOptions,
        ...dateRangeFilters,
      },
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'getBill') {
    const billId = this.getNodeParameter('billId', i) as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/bills/${billId}`,
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'createBill') {
    const name = this.getNodeParameter('name', i) as string;
    const amount_min = this.getNodeParameter('amount_min', i) as number;
    const amount_max = this.getNodeParameter('amount_max', i) as number;
    const date = this.getNodeParameter('date', i) as string;
    const repeat_freq = this.getNodeParameter('repeat_freq', i) as string;
    const billFields = this.getNodeParameter('billFields', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'POST',
      endpoint: '/bills',
      body: {
        name,
        amount_min: String(amount_min),
        amount_max: String(amount_max),
        date,
        repeat_freq,
        ...billFields,
      },
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'updateBill') {
    const billId = this.getNodeParameter('billId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

    // Convert numeric amounts to strings if present
    if (updateFields.amount_min) {
      updateFields.amount_min = String(updateFields.amount_min);
    }
    if (updateFields.amount_max) {
      updateFields.amount_max = String(updateFields.amount_max);
    }

    const response = await fireflyApiRequest.call(this, {
      method: 'PUT',
      endpoint: `/bills/${billId}`,
      body: updateFields,
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'deleteBill') {
    const billId = this.getNodeParameter('billId', i) as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'DELETE',
      endpoint: `/bills/${billId}`,
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'getAttachments') {
    const billId = this.getNodeParameter('billId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/bills/${billId}/attachments`,
      query: {
        ...paginationOptions,
      },
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'getRules') {
    const billId = this.getNodeParameter('billId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/bills/${billId}/rules`,
      query: {
        ...paginationOptions,
      },
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'getTransactions') {
    const billId = this.getNodeParameter('billId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/bills/${billId}/transactions`,
      query: {
        ...paginationOptions,
        ...dateRangeFilters,
      },
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'sumPaid') {
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

    const response = await fireflyApiRequestV2.call(
      this,
      'GET',
      '/bills/sum/paid',
      {},
      dateRangeFilters,
    );
    returnData.push({ json: response });
  } 
  
  else if (operation === 'sumUnpaid') {
    const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

    const response = await fireflyApiRequestV2.call(
      this,
      'GET',
      '/bills/sum/unpaid',
      {},
      dateRangeFilters,
    );
    returnData.push({ json: response });
  }
}
```



---

## 6. Implementation Checklist

### Phase 1: File Creation
- [ ] Create `nodes/FireFlyIII/actions/bills/` directory
- [ ] Create `bills.resource.ts` with operations and fields
- [ ] Verify TypeScript compilation: `pnpm build`
- [ ] Fix any linting issues: `pnpm lintfix`

### Phase 2: Integration
- [ ] Import bills operations and fields in `Fireflyiii.node.ts`
- [ ] Add 'Bills' to resource dropdown options
- [ ] Spread `...billsOperations` and `...billsFields` in properties
- [ ] Import `fireflyApiRequestV2` for v2 operations

### Phase 3: Execute Method
- [ ] Add bills resource block in `execute()` method
- [ ] Implement all 10 operations (8 v1 + 2 v2)
- [ ] Handle amount conversion to strings for API
- [ ] Verify query parameter passing
- [ ] Build and test compilation: `pnpm build`

### Phase 4: Testing
- [ ] Test with live Firefly III instance:
  - [ ] List Bills (with and without date filters)
  - [ ] Get Bill (single bill retrieval)
  - [ ] Create Bill (all required fields)
  - [ ] Update Bill (partial updates)
  - [ ] Delete Bill (verify deletion)
  - [ ] Get Attachments (if bill has attachments)
  - [ ] Get Rules (if bill has rules)
  - [ ] Get Transactions (with date range)
  - [ ] Sum Paid (v2 API)
  - [ ] Sum Unpaid (v2 API)

### Phase 5: Documentation
- [ ] Update README.md to include bills endpoint
- [ ] Update CLAUDE.md with bills implementation notes
- [ ] Document any Firefly III API quirks discovered

---

## 7. Testing Strategy

### Test Cases

**TC-001: List Bills**
- Input: No filters, default pagination
- Expected: JSON response with bills array
- Validation: Response structure matches Firefly III schema

**TC-002: Create Bill**
- Input: name="Internet", amount_min=50, amount_max=60, date="2025-01-15", repeat_freq="monthly"
- Expected: 200 OK with created bill object
- Validation: Bill appears in List Bills operation

**TC-003: Update Bill**
- Input: billId from TC-002, updateFields={amount_max: 70}
- Expected: 200 OK with updated bill
- Validation: amount_max changed to "70" (string)

**TC-004: Date Range Filter**
- Input: listBills with start="2025-01-01", end="2025-12-31"
- Expected: Only bills within date range
- Validation: API calculates appropriate payment/paid dates

**TC-005: API v2 Sum Operations**
- Input: sumPaid with start="2025-01-01", end="2025-01-31"
- Expected: Numeric sum of paid bills in period
- Validation: Uses v2 endpoint, returns sum value

**TC-006: Pagination**
- Input: listBills with limit=10, page=2
- Expected: Second page of results (10 items)
- Validation: Pagination metadata present

### Error Cases

**EC-001: Missing Required Fields**
- Input: createBill without amount_min
- Expected: API error with validation message
- Handling: n8n displays error to user

**EC-002: Invalid Bill ID**
- Input: getBill with billId="99999"
- Expected: 404 Not Found
- Handling: n8n displays error to user

**EC-003: Date Format Validation**
- Input: Invalid date format "15-01-2025"
- Expected: API validation error
- Handling: Field description clarifies YYYY-MM-DD format

---

## 8. Special Considerations

### Amount Handling
Firefly III expects amounts as **strings**, not numbers. The implementation converts numeric inputs to strings:
```typescript
amount_min: String(amount_min),
amount_max: String(amount_max),
```

### API Version Handling
- Most operations use **v1 API** via `fireflyApiRequest`
- Sum operations use **v2 API** via `fireflyApiRequestV2`
- Both utilities handle authentication and base URL construction

### Date Range Behavior
From Firefly III docs: When `start` and `end` parameters are added, Firefly III calculates appropriate payment and paid dates for bills in that period.

### Repeat Frequency Values
Firefly III accepts specific frequency strings: `weekly`, `monthly`, `quarterly`, `half-year`, `yearly`. The dropdown ensures valid values.

---

## 9. Implementation Estimate

**Effort**: ~3-4 hours

| Task | Estimated Time |
|------|---------------|
| File creation and field definitions | 1 hour |
| Integration into main node | 30 minutes |
| Execute method implementation | 1 hour |
| Testing with live instance | 1 hour |
| Documentation updates | 30 minutes |

**Complexity**: Medium (following established patterns)

---

## 10. Future Enhancements

### Possible Additions (Not in Initial Implementation)
- [ ] **Bulk Operations**: Create/update multiple bills in one call
- [ ] **Bill Templates**: Pre-defined bill configurations
- [ ] **Pay Bill Operation**: Mark bill as paid (if API supports)
- [ ] **Bill Analytics**: Extended insights on bill patterns
- [ ] **Webhook Integration**: Bill due notifications

### API Coverage Gaps
- Some Firefly III bill operations may require additional API v2 endpoints
- Check Firefly III changelog for new bill-related endpoints

---

## References

- [Firefly III API Documentation](https://api-docs.firefly-iii.org/)
- [n8n Node Development Docs](https://docs.n8n.io/integrations/creating-nodes/build/)
- Existing patterns: `nodes/FireFlyIII/actions/accounts/accounts.resource.ts`
- Existing patterns: `nodes/FireFlyIII/actions/transactions/transactions.resource.ts`
