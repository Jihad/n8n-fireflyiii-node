/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import { INodeProperties } from 'n8n-workflow';

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
		],
		default: 'listBills',
	},
];

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
				displayName: 'Currency Code',
				name: 'currency_code',
				type: 'string',
				default: '',
				description: 'Currency code (e.g., USD, EUR)',
			},
			{
				displayName: 'Currency ID',
				name: 'currency_id',
				type: 'string',
				default: '',
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
			},
			{
				displayName: 'Object Group Title',
				name: 'object_group_title',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'Number of periods to skip',
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
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the bill is active',
			},
			{
				displayName: 'Currency Code',
				name: 'currency_code',
				type: 'string',
				default: '',
				description: 'Currency code (e.g., USD, EUR)',
			},
			{
				displayName: 'Currency ID',
				name: 'currency_id',
				type: 'string',
				default: '',
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
				displayName: 'Maximum Amount',
				name: 'amount_max',
				type: 'number',
				default: 0,
				description: 'Maximum expected amount',
			},
			{
				displayName: 'Minimum Amount',
				name: 'amount_min',
				type: 'number',
				default: 0,
				description: 'Minimum expected amount',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name of the bill',
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
			},
			{
				displayName: 'Object Group Title',
				name: 'object_group_title',
				type: 'string',
				default: '',
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
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'Number of periods to skip',
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
				operation: ['listBills', 'getTransactions'],
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
				operation: ['listBills', 'getAttachments', 'getRules', 'getTransactions'],
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
