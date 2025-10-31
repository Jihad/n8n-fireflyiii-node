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
