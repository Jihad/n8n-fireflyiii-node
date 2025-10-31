# Object Groups Endpoint Implementation Design

**Target**: Firefly III API v1 (6.4.0) `/api/v1/object-groups`  
**Pattern**: Follow existing resource structure (bills, piggyBanks, accounts)  
**Status**: Design Phase

---

## 1. API Endpoint Analysis

### Firefly III Object Groups API v1 Operations

Object Groups are organizational containers in Firefly III that can group bills, piggy banks, and other objects together. **Important**: Object groups are auto-created when associated with other objects and auto-deleted when no objects are linked to them.

| Operation | HTTP Method | Endpoint | Description |
|-----------|-------------|----------|-------------|
| **List Object Groups** | GET | `/api/v1/object-groups` | Retrieve all object groups with pagination |
| **Get Object Group** | GET | `/api/v1/object-groups/{id}` | Retrieve single object group by ID |
| **Update Object Group** | PUT | `/api/v1/object-groups/{id}` | Update existing object group (title/order only) |
| **Delete Object Group** | DELETE | `/api/v1/object-groups/{id}` | Delete an object group |
| **Get Group Bills** | GET | `/api/v1/object-groups/{id}/bills` | List all bills in this object group |
| **Get Group Piggy Banks** | GET | `/api/v1/object-groups/{id}/piggy-banks` | List all piggy banks in this object group |

**Note**: There is **NO CREATE** operation for object groups. They are created automatically when you associate an object (bill, piggy bank) with a group using `object_group_title` or `object_group_id` parameters in those resources' create/update operations.

### Key Parameters

**Common Parameters:**
- `id` (path parameter) - Object group identifier for single-group operations
- `page`, `limit` (query) - Pagination for list operations

**Object Group Data Fields (Update Only):**
- `title` (string, required) - Object group name/title
- `order` (integer) - Display order of the object group

**Read-Only Fields:**
- `created_at` (datetime) - Timestamp when created
- `updated_at` (datetime) - Timestamp when last updated

---

## 2. File Structure Design

Following the established pattern in `nodes/FireFlyIII/actions/`:

```
nodes/FireFlyIII/actions/objectGroups/
└── objectGroups.resource.ts       # All operations and fields in single file
```

**Decision**: Single file implementation. Object groups have minimal fields (only title and order), making separate field files unnecessary.

---

## 3. objectGroups.resource.ts Structure

### 3.1 Operations Definition

```typescript
import { INodeProperties } from 'n8n-workflow';

export const objectGroupsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['objectGroups'],
      },
    },
    options: [
      {
        name: 'List Object Groups',
        value: 'listObjectGroups',
        description: 'Retrieve all object groups',
        action: 'List object groups',
      },
      {
        name: 'Get Object Group',
        value: 'getObjectGroup',
        description: 'Retrieve a single object group',
        action: 'Get object group',
      },
      {
        name: 'Update Object Group',
        value: 'updateObjectGroup',
        description: 'Update an existing object group',
        action: 'Update object group',
      },
      {
        name: 'Delete Object Group',
        value: 'deleteObjectGroup',
        description: 'Delete an object group',
        action: 'Delete object group',
      },
      {
        name: 'Get Bills',
        value: 'getBills',
        description: 'List all bills in this object group',
        action: 'Get object group bills',
      },
      {
        name: 'Get Piggy Banks',
        value: 'getPiggyBanks',
        description: 'List all piggy banks in this object group',
        action: 'Get object group piggy banks',
      },
    ],
    default: 'listObjectGroups',
  },
];
```

### 3.2 Field Definitions Structure

```typescript
export const objectGroupsFields: INodeProperties[] = [
  // ----------------------------------
  //     Shared Object Group ID Field
  // ----------------------------------
  {
    displayName: 'Object Group ID',
    name: 'objectGroupId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['objectGroups'],
        operation: [
          'getObjectGroup',
          'updateObjectGroup',
          'deleteObjectGroup',
          'getBills',
          'getPiggyBanks',
        ],
      },
    },
    description: 'The ID of the object group',
  },

  // ----------------------------------
  //     CREATE NOTICE
  // ----------------------------------
  {
    displayName: 'Object groups cannot be created directly',
    name: 'createNotice',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['objectGroups'],
        operation: ['listObjectGroups'],
      },
    },
    description:
      'Object groups are automatically created when you associate bills or piggy banks with a group using object_group_title or object_group_id parameters',
  },

  // ----------------------------------
  //     UPDATE OBJECT GROUP FIELDS
  // ----------------------------------
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['objectGroups'],
        operation: ['updateObjectGroup'],
      },
    },
    description: 'The title/name of the object group',
  },
  {
    displayName: 'Additional Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['objectGroups'],
        operation: ['updateObjectGroup'],
      },
    },
    options: [
      {
        displayName: 'Order',
        name: 'order',
        type: 'number',
        default: 1,
        description: 'Display order of the object group',
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
        resource: ['objectGroups'],
        operation: ['listObjectGroups', 'getBills', 'getPiggyBanks'],
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
  objectGroupsOperations,
  objectGroupsFields,
} from './actions/objectGroups/objectGroups.resource';
```

### 4.2 Add to Description Property

In the `description` property of `Fireflyiii` class (around line 90-100), add objectGroups to resource options:

```typescript
{
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    { name: 'About', value: 'about' },
    { name: 'Accounts', value: 'accounts' },
    { name: 'Bills', value: 'bills' },
    { name: 'Budgets', value: 'budgets' },
    { name: 'Categories', value: 'categories' },
    { name: 'General', value: 'general' },
    { name: 'Object Groups', value: 'objectGroups' },  // ADD THIS
    { name: 'Piggy Banks', value: 'piggyBanks' },
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
  ...objectGroupsOperations,
  ...objectGroupsFields,
  // ... rest of properties
],
```

---

## 5. Execute Method Implementation

Add objectGroups block in `execute()` method (after piggyBanks block, around line 900-950):

```typescript
// ----------------------------------
//          Object Groups API
// ----------------------------------
else if (resource === 'objectGroups') {
  if (operation === 'listObjectGroups') {
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: '/object-groups',
      query: {
        ...paginationOptions,
      },
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'getObjectGroup') {
    const objectGroupId = this.getNodeParameter('objectGroupId', i) as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/object-groups/${objectGroupId}`,
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'updateObjectGroup') {
    const objectGroupId = this.getNodeParameter('objectGroupId', i) as string;
    const title = this.getNodeParameter('title', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'PUT',
      endpoint: `/object-groups/${objectGroupId}`,
      body: {
        title,
        ...updateFields,
      },
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'deleteObjectGroup') {
    const objectGroupId = this.getNodeParameter('objectGroupId', i) as string;

    const response = await fireflyApiRequest.call(this, {
      method: 'DELETE',
      endpoint: `/object-groups/${objectGroupId}`,
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'getBills') {
    const objectGroupId = this.getNodeParameter('objectGroupId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/object-groups/${objectGroupId}/bills`,
      query: {
        ...paginationOptions,
      },
    });
    returnData.push({ json: response });
  } 
  
  else if (operation === 'getPiggyBanks') {
    const objectGroupId = this.getNodeParameter('objectGroupId', i) as string;
    const paginationOptions = this.getNodeParameter('paginationOptions', i, {}) as IDataObject;

    const response = await fireflyApiRequest.call(this, {
      method: 'GET',
      endpoint: `/object-groups/${objectGroupId}/piggy-banks`,
      query: {
        ...paginationOptions,
      },
    });
    returnData.push({ json: response });
  }
}
```

---

## 6. Implementation Checklist

### Phase 1: File Creation
- [ ] Create `nodes/FireFlyIII/actions/objectGroups/` directory
- [ ] Create `objectGroups.resource.ts` with operations and fields
- [ ] Verify TypeScript compilation: `pnpm build`
- [ ] Fix any linting issues: `pnpm lintfix`

### Phase 2: Integration
- [ ] Import objectGroups operations and fields in `Fireflyiii.node.ts`
- [ ] Add 'Object Groups' to resource dropdown options
- [ ] Spread `...objectGroupsOperations` and `...objectGroupsFields` in properties

### Phase 3: Execute Method
- [ ] Add objectGroups resource block in `execute()` method
- [ ] Implement all 6 operations (no create operation)
- [ ] Verify query parameter passing
- [ ] Build and test compilation: `pnpm build`

### Phase 4: Testing
- [ ] Test with live Firefly III instance:
  - [ ] List Object Groups (with and without pagination)
  - [ ] Get Object Group (single group retrieval)
  - [ ] Update Object Group (title and order)
  - [ ] Delete Object Group (verify deletion)
  - [ ] Get Bills (retrieve bills in group)
  - [ ] Get Piggy Banks (retrieve piggy banks in group)
  - [ ] Create test via Bills/Piggy Banks with `object_group_title`

### Phase 5: Documentation
- [ ] Update README.md to include object groups endpoint
- [ ] Update CLAUDE.md with object groups implementation notes
- [ ] Document the auto-create/auto-delete behavior
- [ ] Add note about creating groups via bills/piggy banks

---

## 7. Testing Strategy

### Test Cases

**TC-001: List Object Groups**
- Input: No filters, default pagination
- Expected: JSON response with object groups array
- Validation: Response structure matches Firefly III schema

**TC-002: Create Object Group via Bill**
- Setup: Create a bill with `object_group_title: "Test Group"`
- Expected: Object group auto-created and associated with bill
- Validation: Group appears in List Object Groups operation

**TC-003: Get Object Group**
- Input: objectGroupId from TC-002
- Expected: 200 OK with object group details
- Validation: Returns title, order, created_at, updated_at

**TC-004: Update Object Group**
- Input: objectGroupId, title="Updated Group", order=5
- Expected: 200 OK with updated object group
- Validation: Title and order changed in response

**TC-005: Get Bills in Group**
- Input: objectGroupId from TC-002
- Expected: Array of bills associated with group
- Validation: Contains the bill created in TC-002

**TC-006: Get Piggy Banks in Group**
- Setup: Create piggy bank with same objectGroupId
- Expected: Array of piggy banks in group
- Validation: Contains newly created piggy bank

**TC-007: Delete Object Group**
- Input: objectGroupId from TC-002
- Expected: 204 No Content
- Validation: Group no longer appears in list

**TC-008: Auto-Delete Behavior**
- Setup: Create group via bill, then delete the bill
- Expected: Object group auto-deleted (404 on get)
- Validation: Group removed when no objects linked

**TC-009: Pagination**
- Setup: Create multiple groups via bills/piggy banks
- Input: listObjectGroups with limit=5, page=1
- Expected: First 5 groups returned
- Validation: Pagination metadata present

### Error Cases

**EC-001: Invalid Object Group ID**
- Input: getObjectGroup with objectGroupId="99999"
- Expected: 404 Not Found
- Handling: n8n displays error to user

**EC-002: Update Without Title**
- Input: updateObjectGroup without title parameter
- Expected: 422 Validation Error (title is required)
- Handling: n8n displays validation error

**EC-003: Delete Non-Existent Group**
- Input: deleteObjectGroup with invalid ID
- Expected: 404 Not Found
- Handling: n8n displays error to user

---

## 8. Special Considerations

### No Create Operation
**Critical**: Object groups **cannot be created directly**. They are automatically created when you:
1. Create/update a **bill** with `object_group_title` or `object_group_id`
2. Create/update a **piggy bank** with `object_group_title` or `object_group_id`

The implementation includes a `notice` field to inform users about this behavior.

### Auto-Delete Behavior
Object groups are automatically deleted when:
- No bills are associated with the group
- No piggy banks are associated with the group
- No other objects are linked to the group

This is Firefly III's internal behavior and cannot be disabled.

### Minimal Data Model
Object groups have only two editable fields:
- `title` (required) - The group name
- `order` (optional) - Display order for sorting

This makes them one of the simplest resources in the Firefly III API.

### API Consistency
All operations follow standard REST patterns:
- GET for retrieval (list, single, related objects)
- PUT for updates
- DELETE for removal
- No POST (no direct creation)

---

## 9. Implementation Estimate

**Effort**: ~2-3 hours

| Task | Estimated Time |
|------|---------------|
| File creation and field definitions | 45 minutes |
| Integration into main node | 20 minutes |
| Execute method implementation | 45 minutes |
| Testing with live instance | 45 minutes |
| Documentation updates | 15 minutes |

**Complexity**: Low-Medium
- Simple data model (only title and order)
- No create operation simplifies implementation
- Standard CRUD patterns (minus Create)
- Straightforward integration with bills/piggy banks

---

## 10. Documentation Updates Required

### CLAUDE.md Additions

Add to the "Implemented Resources" section:

```markdown
- **Object Groups** (`/api/v1/object-groups/*`): Full operations except Create (6 operations)
  - List, Get, Update, Delete object groups
  - Get related bills and piggy banks
  - **Note**: Object groups are auto-created via bills/piggy banks with `object_group_title`
```

Add to "API Gotchas" section:

```markdown
### Object Group Auto-Creation
Object groups cannot be created directly through the API. Instead:
- Create/update bills or piggy banks with `object_group_title` parameter
- Firefly III automatically creates the object group
- Groups auto-delete when no objects are linked to them
```

### README.md Additions

Add to features list:
```markdown
- **Object Groups**: List, retrieve, update, and delete object groups (auto-created via bills/piggy banks)
```

---

## 11. Future Enhancements

### Possible Additions (Not in Initial Implementation)
- [ ] **Bulk Group Operations**: Assign multiple bills/piggy banks to groups
- [ ] **Group Analytics**: Aggregate statistics for grouped objects
- [ ] **Group Templates**: Predefined group structures
- [ ] **Reorder Groups**: Batch update order values
- [ ] **Group Search**: Filter groups by title pattern

### API Coverage Considerations
- Object groups are feature-complete for v1 API
- No additional v2 endpoints exist for object groups
- Future Firefly III versions may add group creation endpoints

---

## 12. Related Operations

### Creating Object Groups Indirectly

**Via Bills API:**
```typescript
// When creating a bill, add:
{
  name: "Internet Bill",
  amount_min: "50",
  amount_max: "60",
  date: "2025-01-15",
  repeat_freq: "monthly",
  object_group_title: "Utilities"  // Creates "Utilities" group
}
```

**Via Piggy Banks API:**
```typescript
// When creating a piggy bank, add:
{
  name: "Vacation Fund",
  target_amount: "5000",
  account_id: "123",
  object_group_title: "Savings Goals"  // Creates "Savings Goals" group
}
```

### Integration Points
1. **Bills Resource**: Uses `object_group_id` and `object_group_title` fields
2. **Piggy Banks Resource**: Uses `object_group_id` and `object_group_title` fields
3. **Object Groups Resource**: Retrieves bills and piggy banks within groups

---

## References

- [Firefly III API Documentation](https://api-docs.firefly-iii.org/)
- [Firefly III Object Groups Tag](https://api-docs.firefly-iii.org/?urls.primaryName=2.1.0%20(v1)#/object_groups)
- OpenAPI Spec: `.claude/docs/firefly-iii-6.4.0-v1.yaml` lines 10074-10462
- Existing patterns: `nodes/FireFlyIII/actions/bills/bills.resource.ts`
- Existing patterns: `nodes/FireFlyIII/actions/piggyBanks/piggyBanks.resource.ts`

---

## Appendix: API Response Examples

### List Object Groups Response
```json
{
  "data": [
    {
      "type": "object-groups",
      "id": "1",
      "attributes": {
        "created_at": "2025-01-01T00:00:00+00:00",
        "updated_at": "2025-01-15T00:00:00+00:00",
        "title": "Utilities",
        "order": 1
      }
    }
  ],
  "meta": {
    "pagination": {
      "total": 10,
      "count": 1,
      "per_page": 50,
      "current_page": 1,
      "total_pages": 1
    }
  }
}
```

### Get Object Group Response
```json
{
  "data": {
    "type": "object-groups",
    "id": "1",
    "attributes": {
      "created_at": "2025-01-01T00:00:00+00:00",
      "updated_at": "2025-01-15T00:00:00+00:00",
      "title": "Utilities",
      "order": 1
    }
  }
}
```

### Update Object Group Request
```json
{
  "title": "Monthly Utilities",
  "order": 2
}
```
