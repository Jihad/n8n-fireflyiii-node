/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import { INodeProperties } from 'n8n-workflow';

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

export const budgetsFields: INodeProperties[] = [
	// ----------------------------------
	//       Shared Budget ID Field
	// ----------------------------------
	{
		displayName: 'Budget ID',
		name: 'budgetId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: [
					'getBudget',
					'updateBudget',
					'deleteBudget',
					'listBudgetLimits',
					'createBudgetLimit',
					'getBudgetLimit',
					'updateBudgetLimit',
					'deleteBudgetLimit',
					'getTransactions',
					'getAttachments',
					'getLimitTransactions',
				],
			},
		},
		description: 'The ID of the budget',
	},

	// ----------------------------------
	//    Shared Budget Limit ID Field
	// ----------------------------------
	{
		displayName: 'Budget Limit ID',
		name: 'budgetLimitId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: [
					'getBudgetLimit',
					'updateBudgetLimit',
					'deleteBudgetLimit',
					'getLimitTransactions',
				],
			},
		},
		description: 'The ID of the budget limit (must be associated with the budget)',
	},

	// ----------------------------------
	//      CREATE BUDGET FIELDS
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: ['createBudget'],
			},
		},
		description: 'The name of the budget',
		placeholder: 'Groceries',
	},
	{
		displayName: 'Additional Budget Fields',
		name: 'budgetFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: ['createBudget'],
			},
		},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the budget is active',
			},
			{
				displayName: 'Auto Budget Amount',
				name: 'auto_budget_amount',
				type: 'string',
				default: '',
				placeholder: '500.00',
				description: 'Amount for automatic budget allocation',
			},
			{
				displayName: 'Auto Budget Currency Code',
				name: 'auto_budget_currency_code',
				type: 'string',
				default: '',
				placeholder: 'EUR',
				description: 'Currency code for auto-budget (e.g., USD, EUR, GBP)',
			},
			{
				displayName: 'Auto Budget Currency ID',
				name: 'auto_budget_currency_id',
				type: 'string',
				default: '',
				description: 'Currency ID for auto-budget (use either ID or code, not both)',
			},
			{
				displayName: 'Auto Budget Period',
				name: 'auto_budget_period',
				type: 'options',
				options: [
					{
						name: 'Daily',
						value: 'daily',
					},
					{
						name: 'Weekly',
						value: 'weekly',
					},
					{
						name: 'Monthly',
						value: 'monthly',
					},
					{
						name: 'Quarterly',
						value: 'quarterly',
					},
					{
						name: 'Half Year',
						value: 'half_year',
					},
					{
						name: 'Yearly',
						value: 'yearly',
					},
				],
				default: 'monthly',
				description: 'Period for automatic budget allocation',
			},
			{
				displayName: 'Auto Budget Type',
				name: 'auto_budget_type',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Reset',
						value: 'reset',
					},
					{
						name: 'Rollover',
						value: 'rollover',
					},
				],
				default: 'none',
				description: 'Type of automatic budgeting',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Additional notes for the budget',
			},
		],
	},

	// ----------------------------------
	//      UPDATE BUDGET FIELDS
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: ['updateBudget'],
			},
		},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the budget is active',
			},
			{
				displayName: 'Auto Budget Amount',
				name: 'auto_budget_amount',
				type: 'string',
				default: '',
				placeholder: '500.00',
				description: 'Amount for automatic budget allocation',
			},
			{
				displayName: 'Auto Budget Currency Code',
				name: 'auto_budget_currency_code',
				type: 'string',
				default: '',
				placeholder: 'EUR',
				description: 'Currency code for auto-budget (e.g., USD, EUR, GBP)',
			},
			{
				displayName: 'Auto Budget Currency ID',
				name: 'auto_budget_currency_id',
				type: 'string',
				default: '',
				description: 'Currency ID for auto-budget (use either ID or code, not both)',
			},
			{
				displayName: 'Auto Budget Period',
				name: 'auto_budget_period',
				type: 'options',
				options: [
					{
						name: 'Daily',
						value: 'daily',
					},
					{
						name: 'Weekly',
						value: 'weekly',
					},
					{
						name: 'Monthly',
						value: 'monthly',
					},
					{
						name: 'Quarterly',
						value: 'quarterly',
					},
					{
						name: 'Half Year',
						value: 'half_year',
					},
					{
						name: 'Yearly',
						value: 'yearly',
					},
				],
				default: 'monthly',
				description: 'Period for automatic budget allocation',
			},
			{
				displayName: 'Auto Budget Type',
				name: 'auto_budget_type',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Reset',
						value: 'reset',
					},
					{
						name: 'Rollover',
						value: 'rollover',
					},
				],
				default: 'none',
				description: 'Type of automatic budgeting',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Updated budget name',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Additional notes for the budget',
			},
		],
	},

	// ----------------------------------
	//   CREATE BUDGET LIMIT FIELDS
	// ----------------------------------
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: ['createBudgetLimit'],
			},
		},
		description: 'Budget limit amount',
		placeholder: '500.00',
	},
	{
		displayName: 'Start Date',
		name: 'start',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: ['createBudgetLimit'],
			},
		},
		description: 'Start date of the budget limit (YYYY-MM-DD)',
		placeholder: '2025-01-01',
	},
	{
		displayName: 'End Date',
		name: 'end',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: ['createBudgetLimit'],
			},
		},
		description: 'End date of the budget limit (YYYY-MM-DD)',
		placeholder: '2025-01-31',
	},
	{
		displayName: 'Budget Limit Fields',
		name: 'budgetLimitFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: ['createBudgetLimit'],
			},
		},
		options: [
			{
				displayName: 'Currency Code',
				name: 'currency_code',
				type: 'string',
				default: '',
				description: 'Currency code (e.g., EUR, USD)',
				placeholder: 'EUR',
			},
			{
				displayName: 'Currency ID',
				name: 'currency_id',
				type: 'string',
				default: '',
				description: 'Currency ID (use either ID or code, not both)',
			},
		],
	},

	// ----------------------------------
	//   UPDATE BUDGET LIMIT FIELDS
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateLimitFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: ['updateBudgetLimit'],
			},
		},
		options: [
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'string',
				default: '',
				description: 'Updated budget limit amount',
				placeholder: '600.00',
			},
			{
				displayName: 'Currency Code',
				name: 'currency_code',
				type: 'string',
				default: '',
				description: 'Currency code (e.g., EUR, USD)',
				placeholder: 'EUR',
			},
			{
				displayName: 'Currency ID',
				name: 'currency_id',
				type: 'string',
				default: '',
				description: 'Currency ID (use either ID or code, not both)',
			},
			{
				displayName: 'End Date',
				name: 'end',
				type: 'string',
				default: '',
				description: 'Updated end date (YYYY-MM-DD)',
				placeholder: '2025-01-31',
			},
			{
				displayName: 'Start Date',
				name: 'start',
				type: 'string',
				default: '',
				description: 'Updated start date (YYYY-MM-DD)',
				placeholder: '2025-01-01',
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
				resource: ['budgets'],
				operation: [
					'listBudgets',
					'getBudget',
					'listBudgetLimits',
					'getTransactions',
					'getLimitTransactions',
					'listAllBudgetLimits',
					'getTransactionsWithoutBudget',
				],
			},
		},
		options: [
			{
				displayName: 'Start Date',
				name: 'start',
				type: 'string',
				default: '',
				description: 'Start date for filtering (YYYY-MM-DD)',
				placeholder: '2025-01-01',
			},
			{
				displayName: 'End Date',
				name: 'end',
				type: 'string',
				default: '',
				description: 'End date for filtering (YYYY-MM-DD)',
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
				resource: ['budgets'],
				operation: [
					'listBudgets',
					'listBudgetLimits',
					'getTransactions',
					'getAttachments',
					'getLimitTransactions',
					'getTransactionsWithoutBudget',
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
	//      TRANSACTION TYPE FILTER
	// ----------------------------------
	{
		displayName: 'Transaction Type',
		name: 'transactionType',
		type: 'options',
		options: [
			{
				name: 'All',
				value: 'all',
			},
			{
				name: 'Withdrawal',
				value: 'withdrawal',
			},
			{
				name: 'Deposit',
				value: 'deposit',
			},
			{
				name: 'Transfer',
				value: 'transfer',
			},
		],
		default: 'all',
		displayOptions: {
			show: {
				resource: ['budgets'],
				operation: ['getTransactions', 'getLimitTransactions', 'getTransactionsWithoutBudget'],
			},
		},
		description: 'Filter transactions by type',
	},
];
