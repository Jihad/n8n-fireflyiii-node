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
		displayName: 'Accounts',
		name: 'accountsData',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['piggyBanks'],
				operation: ['createPiggyBank'],
			},
		},
		description: 'Account(s) associated with this piggy bank',
		options: [
			{
				name: 'account',
				displayName: 'Account',
				values: [
					{
						displayName: 'Account ID',
						name: 'account_id',
						type: 'string',
						default: '',
						required: true,
						description: 'The ID of the asset account',
					},
					{
						displayName: 'Account Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Optional: The name of the account',
					},
					{
						displayName: 'Current Amount',
						name: 'current_amount',
						type: 'string',
						default: '',
						description: 'Optional: The current amount in this account',
					},
				],
			},
		],
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
	{
		displayName: 'Currency Code',
		name: 'currencyCode',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['piggyBanks'],
				operation: ['createPiggyBank'],
			},
		},
		description: 'Currency code (e.g., USD, EUR). Recommended to provide this field.',
		placeholder: 'USD',
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
				displayName: 'Currency ID',
				name: 'currencyId',
				type: 'string',
				default: '',
				description: 'Currency ID. Can be used instead of Currency Code.',
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
			{
				displayName: 'Order',
				name: 'order',
				type: 'number',
				default: 0,
				description: 'Display order for the piggy bank',
			},
			{
				displayName: 'Target Date',
				name: 'targetDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
				description: 'The date you intend to finish saving money',
			},
		],
	},

	// ----------------------------------
	//    UPDATE PIGGY BANK FIELDS
	// ----------------------------------
	{
		displayName: 'Accounts',
		name: 'updateAccountsData',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['piggyBanks'],
				operation: ['updatePiggyBank'],
			},
		},
		description: 'Asset accounts connected to this piggy bank',
		options: [
			{
				name: 'account',
				displayName: 'Account',
				values: [
					{
						displayName: 'Account ID',
						name: 'account_id',
						type: 'string',
						default: '',
						description: 'ID of the asset account',
					},
					{
						displayName: 'Account Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the asset account',
					},
					{
						displayName: 'Current Amount',
						name: 'current_amount',
						type: 'string',
						default: '',
						description: 'Current amount saved in this account for the piggy bank',
					},
				],
			},
		],
	},
	{
		displayName: 'Name',
		name: 'updateName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['piggyBanks'],
				operation: ['updatePiggyBank'],
			},
		},
		description: 'Name of the piggy bank',
	},
	{
		displayName: 'Target Amount',
		name: 'updateTargetAmount',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['piggyBanks'],
				operation: ['updatePiggyBank'],
			},
		},
		description: 'The target amount to save',
	},
	{
		displayName: 'Start Date',
		name: 'updateStartDate',
		type: 'string',
		default: '',
		placeholder: 'YYYY-MM-DD',
		displayOptions: {
			show: {
				resource: ['piggyBanks'],
				operation: ['updatePiggyBank'],
			},
		},
		description: 'The date you started with this piggy bank',
	},
	{
		displayName: 'Currency Code',
		name: 'updateCurrencyCode',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['piggyBanks'],
				operation: ['updatePiggyBank'],
			},
		},
		description: 'Currency code (e.g., USD, EUR)',
		placeholder: 'USD',
	},
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
				displayName: 'Currency ID',
				name: 'currencyId',
				type: 'string',
				default: '',
				description: 'Currency ID. Can be used instead of Currency Code.',
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
			{
				displayName: 'Order',
				name: 'order',
				type: 'number',
				default: 0,
				description: 'Display order for the piggy bank',
			},
			{
				displayName: 'Target Date',
				name: 'targetDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
				description: 'The date you intend to finish saving money',
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
				description: 'Page number to retrieve',
			},
		],
	},
];
