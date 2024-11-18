/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
/* eslint-disable n8n-nodes-base/node-param-collection-type-unsorted-items */
import { INodeProperties } from 'n8n-workflow';

export const updateAccountFields: INodeProperties[] = [
	{
		displayName: 'Account Fields',
		name: 'accountFields',
		type: 'collection',
		placeholder: 'Add Fields to Update',
		description: 'Fields to update for the account',
		default: {},
		displayOptions: {
			show: {
					resource: ['accounts'],
					operation: ['updateAccount', 'createAccount'],
			},
		},
		options: [
			{
				displayName: 'Update Account Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Use only when updating account, not creating',

			},
			{
				displayName: 'IBAN',
				name: 'iban',
				type: 'string',
				default: '',
				description: 'International Bank Account Number. Example: GB98MIDL07009312345678.',
			},
			{
				displayName: 'BIC',
				name: 'bic',
				type: 'string',
				default: '',
				description: 'Bank Identifier Code. Example: BOFAUS3N.',
			},
			{
				displayName: 'Account Number',
				name: 'account_number',
				type: 'string',
				default: '',
				description: 'Account number. Example: 7009312345678.',
			},
			{
				displayName: 'Opening Balance',
				name: 'opening_balance',
				type: 'string',
				default: '',
				description: 'The opening balance of the account. Example: -1012.12.',
			},
			{
				displayName: 'Opening Balance Date',
				name: 'opening_balance_date',
				type: 'string',
				default: '',
				description: 'Date of the opening balance. Example: 2018-09-17T12:46:47+01:00.',
			},
			{
				displayName: 'Virtual Balance',
				name: 'virtual_balance',
				type: 'string',
				default: '',
				description: 'Virtual balance Amount. Example: 123.45.',
			},
			{
				displayName: 'Currency ID',
				name: 'currency_id',
				type: 'string',
				default: '',
				description: 'Use either currency_id or currency_code. Defaults to the user\'s default currency.',
			},
			{
				displayName: 'Currency Code',
				name: 'currency_code',
				type: 'string',
				default: '',
				description: 'Use either currency_id or currency_code. Defaults to the user\'s default currency.',
			},
			{
				displayName: 'Account Active?',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the account is active. Example: false.',
			},
			{
				displayName: 'Account Order',
				name: 'order',
				type: 'number',
				default: 0,
				description: 'Order of the account. Example: 1.',
			},
			{
				displayName: 'Include in Net Worth',
				name: 'include_net_worth',
				type: 'boolean',
				default: true,
				description: 'Whether to include this account in net worth calculations. Example: true.',
			},
			{
				displayName: 'Account Role',
				name: 'account_role',
				type: 'options',
				options: [
					{ name: 'Default Asset', value: 'defaultAsset' },
					{ name: 'Shared Asset', value: 'sharedAsset' },
					{ name: 'Saving Asset', value: 'savingAsset' },
					{ name: 'Credit Card', value: 'ccAsset' },
					{ name: 'Cash Wallet', value: 'cashWalletAsset' },
					{ name: 'None', value: '' },
				],
				default: '',
				description: 'Example: defaultAsset. Is only mandatory when the type is asset.',
			},
			{
				displayName: 'Credit Card Type',
				name: 'credit_card_type',
				type: 'options',
				options: [
					{ name: 'Monthly Full', value: 'monthlyFull' },
					{ name: 'None', value: '' },
				],
				default: '',
				description: 'Type of credit card. Example: monthlyFull.',
			},
			{
				displayName: 'Monthly Payment Date',
				name: 'monthly_payment_date',
				type: 'string',
				default: '',
				description: 'Mandatory when the account_role is ccAsset. Moment at which CC payment installments are asked for by the bank.',
			},
			{
				displayName: 'Liability Type',
				name: 'liability_type',
				type: 'options',
				options: [
					{ name: 'Loan', value: 'loan' },
					{ name: 'Debt', value: 'debt' },
					{ name: 'Mortgage', value: 'mortgage' },
					{ name: 'None', value: '' },
				],
				default: '',
				description: 'Mandatory when type is liability. Specifies the exact type.',
			},
			{
				displayName: 'Interest',
				name: 'interest',
				type: 'string',
				default: '',
				description: 'Mandatory when type is liability. Interest percentage. Example: 5.3.',
			},
			{
				displayName: 'Interest Period',
				name: 'interest_period',
				type: 'options',
				options: [
					{ name: 'Monthly', value: 'monthly' },
					{ name: 'Quarterly', value: 'quarterly' },
					{ name: 'Yearly', value: 'yearly' },
					{ name: 'None', value: '' },
				],
				default: '',
				description: 'Mandatory when type is liability. Period for interest calculation.',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes for the account. Example: Some example notes.',
			},
			{
				displayName: 'Location Latitude',
				name: 'latitude',
				type: 'number',
				default: null,
				description: 'Latitude of the account\'s location. Example: 51.983333.',
			},
			{
				displayName: 'Location Longitude',
				name: 'longitude',
				type: 'number',
				default: null,
				description: 'Longitude of the account\'s location. Example: 5.916667.',
			},
			{
				displayName: 'Zoom Level',
				name: 'zoom_level',
				type: 'number',
				default: null,
				description: 'Zoom level for the map. Example: 6.',
			},
		],
	},
];
