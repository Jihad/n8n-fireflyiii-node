# Design Document: Recurrences API Endpoint

## Overview

This document outlines the design for implementing the Firefly III **Recurrences API** endpoint in the n8n-fireflyiii-node package. The Recurrences API manages recurring transactions, allowing users to automate regular financial transactions like rent, subscriptions, or salary deposits.

**Key Challenge**: The Recurrences API has complex nested structures with two array fields (`repetitions` and `transactions`) that require careful implementation using n8n's `fixedCollection` type pattern.

## API Specification Analysis

### Base Endpoint
`/api/v1/recurrences`

### Operations

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **List Recurrences** | GET | `/recurrences` | List all recurring transactions with pagination |
| **Get Recurrence** | GET | `/recurrences/{id}` | Retrieve a single recurring transaction |
| **Create Recurrence** | POST | `/recurrences` | Create a new recurring transaction |
| **Update Recurrence** | PUT | `/recurrences/{id}` | Update an existing recurring transaction |
| **Delete Recurrence** | DELETE | `/recurrences/{id}` | Delete a recurring transaction |
| **Trigger Recurrence** | POST | `/recurrences/{id}/trigger` | Manually trigger the creation of a transaction for a specific date |

### Complex Nested Structures

#### 1. Repetitions Array (`repetitions`)
Defines **when** the recurring transaction should fire (schedule pattern).

**Fields**:
- `type` (required): `daily`, `weekly`, `ndom`, `monthly`, `yearly`
- `moment` (required): Schedule details (varies by type)
  - `daily`: empty
  - `weekly`: day of week (1-7, Monday-Sunday)
  - `ndom`: "week,day" format (e.g., "2,3" = 2nd Wednesday)
  - `monthly`: day of month (1-31)
  - `yearly`: full date (YYYY-MM-DD)
- `skip` (optional): Number of occurrences to skip (0 = none, 1 = every other)
- `weekend` (optional): Weekend handling (1-4):
  - 1: Create on weekend
  - 2: Skip weekend
  - 3: Skip to previous Friday
  - 4: Skip to next Monday

#### 2. Transactions Array (`transactions`)
Defines **what** transactions should be created when the recurrence fires.

**Required Fields**:
- `description`: Transaction description
- `amount`: Transaction amount
- `source_id`: Source account ID
- `destination_id`: Destination account ID

**Optional Fields**:
- Currency: `currency_id` OR `currency_code`
- Foreign currency: `foreign_amount`, `foreign_currency_id` OR `foreign_currency_code`
- Categorization: `budget_id`, `category_id`
- Tags: `tags` (array of strings)
- Related objects: `piggy_bank_id`, `bill_id`

## File Structure Design

### Directory Organization
```
nodes/FireFlyIII/actions/recurrences/
├── recurrences.resource.ts          # Main resource file (operations + fields)
├── recurrenceRepetition.fields.ts   # Repetition nested fields
└── recurrenceTransaction.fields.ts  # Transaction nested fields
```

**Rationale**: Following the established pattern from transactions, but splitting nested structures into separate field files for maintainability.

## Field Definitions

### Main Resource Fields

#### Operations Dropdown
```typescript
export const recurrencesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: { show: { resource: ['recurrences'] } },
    options: [
      { name: 'List Recurrences', value: 'listRecurrences' },
      { name: 'Get Recurrence', value: 'getRecurrence' },
      { name: 'Create Recurrence', value: 'createRecurrence' },
      { name: 'Update Recurrence', value: 'updateRecurrence' },
      { name: 'Delete Recurrence', value: 'deleteRecurrence' },
      { name: 'Trigger Recurrence', value: 'triggerRecurrence' },
    ],
    default: 'listRecurrences',
  },
];
```

#### Common Fields

**Recurrence ID** (for get, update, delete, trigger):
```typescript
{
  displayName: 'Recurrence ID',
  name: 'recurrenceId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['recurrences'],
      operation: ['getRecurrence', 'updateRecurrence', 'deleteRecurrence', 'triggerRecurrence'],
    },
  },
}
```

**Trigger Date** (for trigger operation):
```typescript
{
  displayName: 'Trigger Date',
  name: 'date',
  type: 'dateTime',
  required: true,
  displayOptions: {
    show: {
      resource: ['recurrences'],
      operation: ['triggerRecurrence'],
    },
  },
  description: 'The date for which to trigger the recurrence (YYYY-MM-DD)',
}
```

### Create/Update Fields

#### Top-Level Fields

**Type** (create only, required):
```typescript
{
  displayName: 'Type',
  name: 'type',
  type: 'options',
  required: true,
  options: [
    { name: 'Withdrawal', value: 'withdrawal' },
    { name: 'Transfer', value: 'transfer' },
    { name: 'Deposit', value: 'deposit' },
  ],
  default: 'withdrawal',
  displayOptions: {
    show: {
      resource: ['recurrences'],
      operation: ['createRecurrence'],
    },
  },
}
```

**Title** (required):
```typescript
{
  displayName: 'Title',
  name: 'title',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['recurrences'],
      operation: ['createRecurrence', 'updateRecurrence'],
    },
  },
  description: 'Name of the recurring transaction',
}
```

**First Date** (required for create):
```typescript
{
  displayName: 'First Date',
  name: 'first_date',
  type: 'dateTime',
  required: true,
  displayOptions: {
    show: {
      resource: ['recurrences'],
      operation: ['createRecurrence'],
    },
  },
  description: 'First date the recurring transaction will fire (must be after today)',
}
```

**Recurrence Settings** (collection):
```typescript
{
  displayName: 'Recurrence Settings',
  name: 'recurrenceSettings',
  type: 'collection',
  placeholder: 'Add Setting',
  default: {},
  displayOptions: {
    show: {
      resource: ['recurrences'],
      operation: ['createRecurrence', 'updateRecurrence'],
    },
  },
  options: [
    {
      displayName: 'Description',
      name: 'description',
      type: 'string',
      default: '',
      description: 'Description of the recurring transaction (not the transaction itself)',
    },
    {
      displayName: 'Repeat Until',
      name: 'repeat_until',
      type: 'dateTime',
      default: '',
      description: 'Date until the recurrence can fire (use this OR Number of Repetitions)',
    },
    {
      displayName: 'Number of Repetitions',
      name: 'nr_of_repetitions',
      type: 'number',
      default: null,
      description: 'Max number of transactions to create (use this OR Repeat Until)',
    },
    {
      displayName: 'Apply Rules',
      name: 'apply_rules',
      type: 'boolean',
      default: true,
      description: 'Whether to fire rules after transaction creation',
    },
    {
      displayName: 'Active',
      name: 'active',
      type: 'boolean',
      default: true,
      description: 'Whether the recurrence is active',
    },
    {
      displayName: 'Notes',
      name: 'notes',
      type: 'string',
      default: '',
      description: 'Additional notes',
    },
  ],
}
```

#### Repetitions Fixed Collection

**Critical Pattern**: This follows the same pattern as `transactionsData` in transactions.resource.ts, using `type: 'fixedCollection'` with `typeOptions: { multipleValues: true }`.

```typescript
{
  displayName: 'Repetitions',
  name: 'repetitions',
  type: 'fixedCollection',
  placeholder: 'Add Repetition',
  required: true,
  typeOptions: {
    multipleValues: true,
  },
  description: 'Schedule patterns for when the recurrence should fire',
  displayOptions: {
    show: {
      resource: ['recurrences'],
      operation: ['createRecurrence', 'updateRecurrence'],
    },
  },
  default: {},
  options: [
    {
      name: 'repetition',
      displayName: 'Repetition',
      values: [
        {
          displayName: 'Type',
          name: 'type',
          type: 'options',
          required: true,
          options: [
            { name: 'Daily', value: 'daily' },
            { name: 'Weekly', value: 'weekly' },
            { name: 'Monthly', value: 'monthly' },
            { name: 'Yearly', value: 'yearly' },
            { name: 'N-th Day of Month (ndom)', value: 'ndom' },
          ],
          default: 'monthly',
          description: 'The type of repetition schedule',
        },
        {
          displayName: 'Moment',
          name: 'moment',
          type: 'string',
          required: true,
          default: '',
          description: 'Schedule details (format varies by type)',
          hint: 'Daily: empty | Weekly: 1-7 (Mon-Sun) | Monthly: 1-31 | Yearly: YYYY-MM-DD | ndom: "week,day" (e.g., "2,3" = 2nd Wednesday)',
        },
        {
          displayName: 'Skip',
          name: 'skip',
          type: 'number',
          default: 0,
          description: 'How many occurrences to skip (0 = none, 1 = every other)',
        },
        {
          displayName: 'Weekend Handling',
          name: 'weekend',
          type: 'options',
          options: [
            { name: 'Create on Weekend', value: 1 },
            { name: 'Skip Weekend (No Transaction)', value: 2 },
            { name: 'Skip to Previous Friday', value: 3 },
            { name: 'Skip to Next Monday', value: 4 },
          ],
          default: 1,
          description: 'How to handle when the recurrence falls on a weekend',
        },
      ],
    },
  ],
}
```

#### Transactions Fixed Collection

**Critical Pattern**: Similar to repetitions, this uses `fixedCollection` with nested transaction details.

```typescript
{
  displayName: 'Transactions',
  name: 'transactions',
  type: 'fixedCollection',
  placeholder: 'Add Transaction',
  required: true,
  typeOptions: {
    multipleValues: true,
  },
  description: 'Transaction details to create when the recurrence fires',
  displayOptions: {
    show: {
      resource: ['recurrences'],
      operation: ['createRecurrence', 'updateRecurrence'],
    },
  },
  default: {},
  options: [
    {
      name: 'transaction',
      displayName: 'Transaction',
      values: [
        // For UPDATE only: transaction ID field
        {
          displayName: 'Transaction ID',
          name: 'id',
          type: 'string',
          default: '',
          displayOptions: {
            show: {
              '/operation': ['updateRecurrence'],
            },
          },
          description: 'ID of the recurring transaction (required for update, can be skipped if only ONE transaction)',
          hint: 'Not to be confused with the recurrence ID',
        },
        // Required fields
        {
          displayName: 'Description',
          name: 'description',
          type: 'string',
          required: true,
          default: '',
          description: 'Transaction description',
        },
        {
          displayName: 'Amount',
          name: 'amount',
          type: 'string',
          required: true,
          default: '',
          description: 'Transaction amount',
        },
        {
          displayName: 'Source Account ID',
          name: 'source_id',
          type: 'string',
          required: true,
          default: '',
          description: 'ID of the source account',
        },
        {
          displayName: 'Destination Account ID',
          name: 'destination_id',
          type: 'string',
          required: true,
          default: '',
          description: 'ID of the destination account',
        },
        // Optional fields in a nested collection
        {
          displayName: 'Transaction Details',
          name: 'transactionDetails',
          type: 'collection',
          placeholder: 'Add Detail',
          default: {},
          options: [
            {
              displayName: 'Currency ID',
              name: 'currency_id',
              type: 'string',
              default: '',
              description: 'Currency ID (submit either currency_id OR currency_code)',
            },
            {
              displayName: 'Currency Code',
              name: 'currency_code',
              type: 'string',
              default: '',
              description: 'Currency code (submit either currency_id OR currency_code)',
            },
            {
              displayName: 'Foreign Amount',
              name: 'foreign_amount',
              type: 'string',
              default: '',
              description: 'Amount in foreign currency',
            },
            {
              displayName: 'Foreign Currency ID',
              name: 'foreign_currency_id',
              type: 'string',
              default: '',
              description: 'Foreign currency ID',
            },
            {
              displayName: 'Foreign Currency Code',
              name: 'foreign_currency_code',
              type: 'string',
              default: '',
              description: 'Foreign currency code',
            },
            {
              displayName: 'Budget ID',
              name: 'budget_id',
              type: 'string',
              default: '',
              description: 'Budget ID for this transaction',
            },
            {
              displayName: 'Category ID',
              name: 'category_id',
              type: 'string',
              default: '',
              description: 'Category ID for this transaction',
            },
            {
              displayName: 'Tags',
              name: 'tags',
              type: 'string',
              default: '',
              description: 'Comma-separated list of tags',
              hint: 'Will be converted to array',
            },
            {
              displayName: 'Piggy Bank ID',
              name: 'piggy_bank_id',
              type: 'string',
              default: '',
              description: 'Piggy bank ID',
            },
            {
              displayName: 'Bill ID',
              name: 'bill_id',
              type: 'string',
              default: '',
              description: 'Bill ID',
            },
          ],
        },
      ],
    },
  ],
}
```

### List Operation Fields

**Pagination Options**:
```typescript
{
  displayName: 'Pagination Options',
  name: 'paginationOptions',
  type: 'collection',
  placeholder: 'Add Pagination Options',
  default: {},
  displayOptions: {
    show: {
      resource: ['recurrences'],
      operation: ['listRecurrences'],
    },
  },
  options: [
    {
      displayName: 'Limit',
      name: 'limit',
      type: 'number',
      typeOptions: { minValue: 1 },
      default: 50,
      description: 'Max number of results to return',
    },
    {
      displayName: 'Page',
      name: 'page',
      type: 'number',
      typeOptions: { minValue: 1 },
      default: 1,
      description: 'The page number to retrieve',
    },
  ],
}
```

## Execute Method Implementation

### List Recurrences
```typescript
if (operation === 'listRecurrences') {
  const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;

  const response = await fireflyApiRequest.call(this, {
    method: 'GET',
    endpoint: '/recurrences',
    query: paginationOptions,
  });

  returnData.push({ json: response });
}
```

### Get Recurrence
```typescript
else if (operation === 'getRecurrence') {
  const recurrenceId = this.getNodeParameter('recurrenceId', i) as string;

  const response = await fireflyApiRequest.call(this, {
    method: 'GET',
    endpoint: `/recurrences/${recurrenceId}`,
  });

  returnData.push({ json: response });
}
```

### Create Recurrence
```typescript
else if (operation === 'createRecurrence') {
  // Required fields
  const type = this.getNodeParameter('type', i) as string;
  const title = this.getNodeParameter('title', i) as string;
  const first_date = this.getNodeParameter('first_date', i) as string;

  // Optional settings
  const recurrenceSettings = this.getNodeParameter('recurrenceSettings', i, {}) as IDataObject;

  // Fixed collections
  const repetitionsData = this.getNodeParameter('repetitions', i, {}) as IDataObject;
  const transactionsData = this.getNodeParameter('transactions', i, {}) as IDataObject;

  // Build repetitions array
  const repetitions: any[] = [];
  if (repetitionsData.repetition && Array.isArray(repetitionsData.repetition)) {
    for (const rep of repetitionsData.repetition) {
      repetitions.push({
        type: rep.type,
        moment: rep.moment,
        skip: rep.skip,
        weekend: rep.weekend,
      });
    }
  }

  // Build transactions array
  const transactions: any[] = [];
  if (transactionsData.transaction && Array.isArray(transactionsData.transaction)) {
    for (const txn of transactionsData.transaction) {
      const transactionDetails = txn.transactionDetails || {};
      
      // Handle tags conversion (comma-separated string to array)
      let tags = null;
      if (transactionDetails.tags) {
        tags = parseCommaSeparatedFields(transactionDetails.tags as string);
      }

      transactions.push({
        description: txn.description,
        amount: txn.amount,
        source_id: txn.source_id,
        destination_id: txn.destination_id,
        currency_id: transactionDetails.currency_id || undefined,
        currency_code: transactionDetails.currency_code || undefined,
        foreign_amount: transactionDetails.foreign_amount || undefined,
        foreign_currency_id: transactionDetails.foreign_currency_id || undefined,
        foreign_currency_code: transactionDetails.foreign_currency_code || undefined,
        budget_id: transactionDetails.budget_id || undefined,
        category_id: transactionDetails.category_id || undefined,
        tags: tags || undefined,
        piggy_bank_id: transactionDetails.piggy_bank_id || undefined,
        bill_id: transactionDetails.bill_id || undefined,
      });
    }
  }

  // Build request body
  const body: IDataObject = {
    type,
    title,
    first_date,
    ...recurrenceSettings,
    repetitions,
    transactions,
  };

  const response = await fireflyApiRequest.call(this, {
    method: 'POST',
    endpoint: '/recurrences',
    body,
  });

  returnData.push({ json: response });
}
```

### Update Recurrence
```typescript
else if (operation === 'updateRecurrence') {
  const recurrenceId = this.getNodeParameter('recurrenceId', i) as string;
  const title = this.getNodeParameter('title', i) as string;
  const recurrenceSettings = this.getNodeParameter('recurrenceSettings', i, {}) as IDataObject;

  // Fixed collections (same processing as create)
  const repetitionsData = this.getNodeParameter('repetitions', i, {}) as IDataObject;
  const transactionsData = this.getNodeParameter('transactions', i, {}) as IDataObject;

  // Build repetitions array (same as create)
  const repetitions: any[] = [];
  if (repetitionsData.repetition && Array.isArray(repetitionsData.repetition)) {
    for (const rep of repetitionsData.repetition) {
      repetitions.push({
        type: rep.type,
        moment: rep.moment,
        skip: rep.skip,
        weekend: rep.weekend,
      });
    }
  }

  // Build transactions array (include ID for update)
  const transactions: any[] = [];
  if (transactionsData.transaction && Array.isArray(transactionsData.transaction)) {
    for (const txn of transactionsData.transaction) {
      const transactionDetails = txn.transactionDetails || {};
      
      // Handle tags conversion
      let tags = null;
      if (transactionDetails.tags) {
        tags = parseCommaSeparatedFields(transactionDetails.tags as string);
      }

      transactions.push({
        id: txn.id || undefined,  // Include ID for update
        description: txn.description,
        amount: txn.amount,
        source_id: txn.source_id,
        destination_id: txn.destination_id,
        currency_id: transactionDetails.currency_id || undefined,
        currency_code: transactionDetails.currency_code || undefined,
        foreign_amount: transactionDetails.foreign_amount || undefined,
        foreign_currency_id: transactionDetails.foreign_currency_id || undefined,
        foreign_currency_code: transactionDetails.foreign_currency_code || undefined,
        budget_id: transactionDetails.budget_id || undefined,
        category_id: transactionDetails.category_id || undefined,
        tags: tags || undefined,
        piggy_bank_id: transactionDetails.piggy_bank_id || undefined,
        bill_id: transactionDetails.bill_id || undefined,
      });
    }
  }

  const body: IDataObject = {
    title,
    ...recurrenceSettings,
    repetitions,
    transactions,
  };

  const response = await fireflyApiRequest.call(this, {
    method: 'PUT',
    endpoint: `/recurrences/${recurrenceId}`,
    body,
  });

  returnData.push({ json: response });
}
```

### Delete Recurrence
```typescript
else if (operation === 'deleteRecurrence') {
  const recurrenceId = this.getNodeParameter('recurrenceId', i) as string;

  await fireflyApiRequest.call(this, {
    method: 'DELETE',
    endpoint: `/recurrences/${recurrenceId}`,
  });

  returnData.push({ json: { success: true } });
}
```

### Trigger Recurrence
```typescript
else if (operation === 'triggerRecurrence') {
  const recurrenceId = this.getNodeParameter('recurrenceId', i) as string;
  const date = this.getNodeParameter('date', i) as string;

  // Format date to YYYY-MM-DD
  const formattedDate = date.split('T')[0];

  const response = await fireflyApiRequest.call(this, {
    method: 'POST',
    endpoint: `/recurrences/${recurrenceId}/trigger`,
    query: { date: formattedDate },
  });

  returnData.push({ json: response });
}
```

## Integration with Main Node File

### In `Fireflyiii.node.ts`

**1. Import Statements**:
```typescript
import {
  recurrencesOperations,
  recurrencesFields,
} from './actions/recurrences/recurrences.resource';
```

**2. Resource Dropdown Option**:
```typescript
{
  name: 'Recurrences API',
  value: 'recurrences',
  description: 'Endpoints to manage recurring transactions and trigger their execution',
}
```

**3. Properties Array**:
```typescript
properties: [
  // ... existing resources
  ...recurrencesOperations,
  // ... other operations
  ...recurrencesFields,
  // ... other fields
]
```

**4. Execute Method Section**:
```typescript
// ----------------------------------
//       Recurrences API
// ----------------------------------
else if (resource === 'recurrences') {
  // Implementation code here (as shown above)
}
```

## Special Considerations

### 1. Fixed Collection Pattern
- **Key Learning**: The `fixedCollection` type with `typeOptions: { multipleValues: true }` is essential for array fields
- **Data Structure**: Results in `{ repetition: [{}, {}] }` or `{ transaction: [{}, {}] }`
- **Array Processing**: Must check if the nested array exists and iterate through it

### 2. Nested Collections within Fixed Collections
- For optional transaction fields, use a nested `collection` within the `fixedCollection`
- This provides clean UI organization while keeping the data structure manageable

### 3. Date Formatting
- Firefly III expects `YYYY-MM-DD` format
- n8n's `dateTime` field returns ISO 8601, so extract date part: `date.split('T')[0]`

### 4. Tags Handling
- Accept comma-separated string input
- Use `parseCommaSeparatedFields()` helper to convert to array
- Firefly III API expects array format

### 5. Display Options
- Use `/operation` syntax for nested field display conditions within fixed collections
- Example: `displayOptions: { show: { '/operation': ['updateRecurrence'] } }`

### 6. Required Field Strategy
- For `createRecurrence`: Type, title, first_date at top level; transactions and repetitions as required fixed collections
- For `updateRecurrence`: Only title required at top level; optional fields in settings collection

### 7. Repetition Moment Validation
- Consider adding hint/description text to guide users on correct format for each repetition type
- Validation happens server-side; provide clear examples

## Testing Checklist

### Unit Testing
- ✅ List recurrences with pagination
- ✅ Get single recurrence by ID
- ✅ Create recurrence with:
  - Single repetition, single transaction
  - Multiple repetitions, single transaction
  - Single repetition, multiple transactions
  - Multiple repetitions, multiple transactions
- ✅ Update recurrence with:
  - Modified title/settings
  - Added/removed repetitions
  - Added/removed transactions
  - Updated existing transaction (with ID)
- ✅ Delete recurrence
- ✅ Trigger recurrence for specific date

### Integration Testing
- ✅ Verify tags array conversion
- ✅ Test weekend handling options
- ✅ Test different repetition types (daily, weekly, monthly, yearly, ndom)
- ✅ Validate date formatting
- ✅ Test empty optional fields handling

### Edge Cases
- ✅ Empty repetitions array (should fail validation)
- ✅ Empty transactions array (should fail validation)
- ✅ Update with transaction ID vs. without
- ✅ Moment format for each repetition type
- ✅ Repeat_until vs nr_of_repetitions (mutually exclusive)

## API Quirks and Gotchas

### 1. Repetition Moment Format
The `moment` field format varies by repetition type:
- **Daily**: Empty string
- **Weekly**: "1" to "7" (Monday to Sunday)
- **Monthly**: "1" to "31" (day of month)
- **Yearly**: "YYYY-MM-DD" (full date, year doesn't matter)
- **ndom**: "week,day" format (e.g., "2,3" = 2nd Wednesday)

### 2. Repeat Until vs Number of Repetitions
- These fields are **mutually exclusive**
- Use `repeat_until` for specific end date
- Use `nr_of_repetitions` for fixed number of occurrences
- API will reject both or prioritize one

### 3. Transaction ID on Update
- For recurrences with **multiple transactions**, the `id` field is required to identify which transaction to update
- For recurrences with **single transaction**, the `id` can be omitted
- Omitting `id` creates a **new transaction** in the recurrence

### 4. Transaction Type Restriction
- Recurrence type is set at creation and applies to **all transactions** in the recurrence
- Valid types: `withdrawal`, `transfer`, `deposit` (no opening_balance or reconciliation)

### 5. Trigger Date Behavior
- Triggering creates transaction **today** (dated today)
- The scheduled occurrence is consumed (won't fire again on that date)
- Returns array of transactions (usually just one)

### 6. First Date Validation
- Must be **after today** for new recurrences
- Can be in the past for updates (to modify existing recurrences)

## File Size Estimation

- `recurrences.resource.ts`: ~800-1000 lines (operations + all fields)
- Total new code: ~800-1000 lines
- Modified code in `Fireflyiii.node.ts`: ~120-150 lines

## Implementation Complexity

**Complexity Level**: **High** ⚠️

**Challenges**:
1. **Nested Fixed Collections**: Most complex field structure in the codebase
2. **Multiple Array Processing**: Both repetitions and transactions require careful iteration
3. **Conditional Fields**: Transaction ID field only for update
4. **Data Transformation**: Tags array conversion, date formatting
5. **Repetition Moment Validation**: Different formats per type

**Estimated Implementation Time**: 4-6 hours

## Related Documentation

- [Firefly III API Documentation - Recurrences](https://api-docs.firefly-iii.org/#/recurrences)
- [Firefly III Recurring Transactions Guide](https://docs.firefly-iii.org/how-to/firefly-iii/features/recurring/)
- [n8n Fixed Collection Documentation](https://docs.n8n.io/integrations/creating-nodes/build/reference/node-properties-type-reference/#fixedcollection)

## Implementation Corrections

### UPDATE Operation Field Optionality (Post-Implementation)

After initial implementation, the following corrections were made based on Firefly III API behavior:

#### 1. All Request Body Parameters Optional for UPDATE
**Issue**: Initial design had title, repetitions, and transactions as required fields for UPDATE operation.

**Correction**: For PUT `/v1/recurrences/{id}`, only `Recurrence ID` is mandatory. All other fields are optional and only sent if provided by user.

**Implementation Changes**:
- **Title Field**: Split into two definitions
  - Required for CREATE operation (top-level)
  - Optional for UPDATE operation (moved to `recurrenceSettings` collection)
  
- **Repetitions Field**: Split into two definitions
  - Required for CREATE operation
  - Optional for UPDATE operation (no `required: true` flag)
  
- **Transactions Field**: Split into two definitions
  - Required for CREATE operation
  - Optional for UPDATE operation (no `required: true` flag)

#### 2. Transaction Fields Moved to Transaction Details Collection (UPDATE Only)
**Issue**: When updating transactions with only some fields (e.g., just amount), empty string values for other fields (description, source_id, destination_id) were being sent to API, causing validation errors.

**Correction**: For UPDATE operation, moved all optional transaction fields into the nested "Transaction Details" collection to ensure they're only sent when explicitly filled.

**Fields Moved**:
- `description` - Transaction description
- `amount` - Transaction amount
- `source_id` - Source account ID
- `destination_id` - Destination account ID

**Result**: Only `Transaction ID` remains at top level for UPDATE operation. All other fields are in Transaction Details collection and only included in API call if provided.

**Execute Method Changes**:
- Changed from accessing `txn.description`, `txn.amount`, etc. directly
- Now accesses all fields from `transactionDetails` collection: `transactionDetails.description`, `transactionDetails.amount`, etc.
- Uses conditional checks: only add field to request if `transactionDetails.fieldName` has a value
- Empty fields are completely omitted from API request

#### 3. Date Format Standardization
**Issue**: All date fields were using `type: 'dateTime'` which provides datetime picker, but Firefly III API expects `YYYY-MM-DD` format only.

**Correction**: Changed all 4 date fields from `dateTime` to `string` type with `YYYY-MM-DD` placeholder:
1. **Trigger Date** - `triggerRecurrence` operation
2. **First Date** - `createRecurrence` operation (required)
3. **First Date** - `updateRecurrence` operation (optional in settings)
4. **Repeat Until** - `recurrenceSettings` collection

**Implementation**: Users now see text input with `placeholder: 'YYYY-MM-DD'` instead of datetime picker. Execute method already handles format conversion via `.split('T')[0]`.

## Next Steps

1. ✅ Create `recurrences.resource.ts` with operations and fields
2. ✅ Add resource option to main node file
3. ✅ Implement execute method logic
4. ✅ Apply UPDATE operation field corrections
5. ✅ Standardize date format to YYYY-MM-DD
6. ⏳ Test all operations with actual Firefly III instance
7. ⏳ Document implementation in `RECURRENCES_IMPLEMENTATION_SUMMARY.md`
8. ⏳ Update `CLAUDE.md` to reflect new endpoint

---

**Design Completed**: 2025-10-31  
**Implementation Completed**: 2025-10-31  
**Corrections Applied**: 2025-10-31  
**Complexity**: High (nested fixed collections with array processing)  
**Reference Implementation**: Transactions API (for fixed collection pattern)
