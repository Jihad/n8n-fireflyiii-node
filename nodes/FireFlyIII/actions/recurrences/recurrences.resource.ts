/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import { INodeProperties } from 'n8n-workflow';

export const recurrencesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['recurrences'],
			},
		},
		options: [
			{
				name: 'List Recurrences',
				value: 'listRecurrences',
				description: 'Retrieve all recurring transactions',
				action: 'List recurrences',
			},
			{
				name: 'Get Recurrence',
				value: 'getRecurrence',
				description: 'Retrieve a single recurring transaction',
				action: 'Get recurrence',
			},
			{
				name: 'Create Recurrence',
				value: 'createRecurrence',
				description: 'Create a new recurring transaction',
				action: 'Create recurrence',
			},
			{
				name: 'Update Recurrence',
				value: 'updateRecurrence',
				description: 'Update an existing recurring transaction',
				action: 'Update recurrence',
			},
			{
				name: 'Delete Recurrence',
				value: 'deleteRecurrence',
				description: 'Delete a recurring transaction',
				action: 'Delete recurrence',
			},
			{
				name: 'Trigger Recurrence',
				value: 'triggerRecurrence',
				description: 'Manually trigger transaction creation for a specific date',
				action: 'Trigger recurrence',
			},
		],
		default: 'listRecurrences',
	},
];

export const recurrencesFields: INodeProperties[] = [
	// ----------------------------------
	//     Common Fields
	// ----------------------------------
	{
		displayName: 'Recurrence ID',
		name: 'recurrenceId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['recurrences'],
				operation: ['getRecurrence', 'updateRecurrence', 'deleteRecurrence', 'triggerRecurrence'],
			},
		},
		description: 'The ID of the recurring transaction',
	},
	{
		displayName: 'Trigger Date',
		name: 'date',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['recurrences'],
				operation: ['triggerRecurrence'],
			},
		},
		description:
			'The date for which to trigger the recurrence. Transaction will be created today and dated today.',
		placeholder: 'YYYY-MM-DD',
		hint: 'Take the date from the list of occurrences in the recurring transaction',
	},

	// ----------------------------------
	//     Create Fields
	// ----------------------------------
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
		description:
			'The type of recurring transaction. This applies to all transactions created by this recurrence.',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['recurrences'],
				operation: ['createRecurrence'],
			},
		},
		description: 'Name of the recurring transaction',
	},
	{
		displayName: 'First Date',
		name: 'first_date',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['recurrences'],
				operation: ['createRecurrence'],
			},
		},
		description: 'First date the recurring transaction will fire (must be after today)',
		placeholder: 'YYYY-MM-DD',
	},

	// ----------------------------------
	//     Recurrence Settings Collection
	// ----------------------------------
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
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the recurrence is active',
			},
			{
				displayName: 'Apply Rules',
				name: 'apply_rules',
				type: 'boolean',
				default: true,
				description: 'Whether to fire rules after the creation of each transaction',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description:
					'Description of the recurring transaction (not to be confused with the description of individual transactions)',
			},
			{
				displayName: 'First Date',
				name: 'first_date',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/operation': ['updateRecurrence'],
					},
				},
				description: 'First date the recurring transaction will fire',
				placeholder: 'YYYY-MM-DD',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Additional notes about this recurrence',
			},
			{
				displayName: 'Number of Repetitions',
				name: 'nr_of_repetitions',
				type: 'number',
				default: undefined,
				description:
					'Maximum number of transactions to create. Use this OR Repeat Until, not both.',
				typeOptions: {
					minValue: 1,
				},
			},
			{
				displayName: 'Repeat Until',
				name: 'repeat_until',
				type: 'string',
				default: '',
				description:
					'Date until the recurrence can fire. After this date, the recurrence becomes inactive. Use this OR Number of Repetitions, not both.',
				placeholder: 'YYYY-MM-DD',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/operation': ['updateRecurrence'],
					},
				},
				description: 'Name of the recurring transaction',
			},
		],
	},

	// ----------------------------------
	//     Repetitions Fixed Collection
	// ----------------------------------
	{
		displayName: 'Repetitions',
		name: 'repetitions',
		type: 'fixedCollection',
		placeholder: 'Add Repetition',
		typeOptions: {
			multipleValues: true,
		},
		description: 'Schedule patterns for when the recurrence should fire (WHEN)',
		displayOptions: {
			show: {
				resource: ['recurrences'],
				operation: ['createRecurrence'],
			},
		},
		required: true,
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
							{
								name: 'N-Th Day of Month (Ndom)',
								value: 'ndom',
								description: 'The n-th weekday of the month (e.g., 2nd Wednesday)',
							},
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
						typeOptions: {
							minValue: 0,
						},
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
	},
	{
		displayName: 'Repetitions',
		name: 'repetitions',
		type: 'fixedCollection',
		placeholder: 'Add Repetition',
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Schedule patterns for when the recurrence should fire (WHEN) - optional for updates',
		displayOptions: {
			show: {
				resource: ['recurrences'],
				operation: ['updateRecurrence'],
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
							{
								name: 'N-Th Day of Month (Ndom)',
								value: 'ndom',
								description: 'The n-th weekday of the month (e.g., 2nd Wednesday)',
							},
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
						typeOptions: {
							minValue: 0,
						},
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
	},

	// ----------------------------------
	//     Transactions Fixed Collection
	// ----------------------------------
	{
		displayName: 'Transactions',
		name: 'transactions',
		type: 'fixedCollection',
		placeholder: 'Add Transaction',
		required: true,
		typeOptions: {
			multipleValues: true,
		},
		description: 'Transaction details to create when the recurrence fires (WHAT)',
		displayOptions: {
			show: {
				resource: ['recurrences'],
				operation: ['createRecurrence'],
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
						description:
							'ID of the recurring transaction to update (required for multiple transactions, can be skipped if only ONE transaction)',
						hint: 'Not to be confused with the recurrence ID. Omit to create a new transaction in the recurrence.',
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
					// Optional fields in nested collection
					{
						displayName: 'Transaction Details',
						name: 'transactionDetails',
						type: 'collection',
						placeholder: 'Add Detail',
						default: {},
						options: [
							{
								displayName: 'Bill ID',
								name: 'bill_id',
								type: 'string',
								default: '',
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
								displayName: 'Currency Code',
								name: 'currency_code',
								type: 'string',
								default: '',
								description: 'Currency code (submit either currency_id OR currency_code)',
							},
							{
								displayName: 'Currency ID',
								name: 'currency_id',
								type: 'string',
								default: '',
								description: 'Currency ID (submit either currency_id OR currency_code)',
							},
							{
								displayName: 'Foreign Amount',
								name: 'foreign_amount',
								type: 'string',
								default: '',
								description: 'Amount in foreign currency',
							},
							{
								displayName: 'Foreign Currency Code',
								name: 'foreign_currency_code',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Foreign Currency ID',
								name: 'foreign_currency_id',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Piggy Bank ID',
								name: 'piggy_bank_id',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Source Account ID',
								name: 'source_id',
								type: 'string',
								default: '',
								description: 'ID of the source account',
							},
							{
								displayName: 'Tags',
								name: 'tags',
								type: 'string',
								default: '',
								description: 'Comma-separated list of tags',
								hint: 'Will be converted to array format',
							},
						],
					},
				],
			},
		],
	},
	{
		displayName: 'Transactions',
		name: 'transactions',
		type: 'fixedCollection',
		placeholder: 'Add Transaction',
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Transaction details to create when the recurrence fires (WHAT) - optional for updates',
		displayOptions: {
			show: {
				resource: ['recurrences'],
				operation: ['updateRecurrence'],
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
						description:
							'ID of the recurring transaction to update (required for multiple transactions, can be skipped if only ONE transaction)',
						hint: 'Not to be confused with the recurrence ID. Omit to create a new transaction in the recurrence.',
					},
					// All optional fields in nested collection for UPDATE
					{
						displayName: 'Transaction Details',
						name: 'transactionDetails',
						type: 'collection',
						placeholder: 'Add Detail',
						default: {},
						description: 'Optional fields - only include fields you want to update',
						options: [
							{
								displayName: 'Amount',
								name: 'amount',
								type: 'string',
								default: '',
								description: 'Transaction amount',
							},
							{
								displayName: 'Bill ID',
								name: 'bill_id',
								type: 'string',
								default: '',
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
								displayName: 'Currency Code',
								name: 'currency_code',
								type: 'string',
								default: '',
								description: 'Currency code (submit either currency_id OR currency_code)',
							},
							{
								displayName: 'Currency ID',
								name: 'currency_id',
								type: 'string',
								default: '',
								description: 'Currency ID (submit either currency_id OR currency_code)',
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								description: 'Transaction description',
							},
							{
								displayName: 'Destination Account ID',
								name: 'destination_id',
								type: 'string',
								default: '',
								description: 'ID of the destination account',
							},
							{
								displayName: 'Foreign Amount',
								name: 'foreign_amount',
								type: 'string',
								default: '',
								description: 'Amount in foreign currency',
							},
							{
								displayName: 'Foreign Currency Code',
								name: 'foreign_currency_code',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Foreign Currency ID',
								name: 'foreign_currency_id',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Piggy Bank ID',
								name: 'piggy_bank_id',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Tags',
								name: 'tags',
								type: 'string',
								default: '',
								description: 'Comma-separated list of tags',
								hint: 'Will be converted to array format',
							},
						],
					},
				],
			},
		],
	},

	// ----------------------------------
	//     Pagination Options
	// ----------------------------------
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
