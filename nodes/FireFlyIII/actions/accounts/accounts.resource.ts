// Disable Lint sorting to keep MY order of things
/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import {
	INodeProperties,
} from 'n8n-workflow';
import { updateAccountFields } from './updateAccount.fields';

export const accountsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['accounts'],
			},
		},
		options: [
			{
				name: 'Get Transactions',
				value: 'getTransactions',
				description: 'List all transactions related to an account',
				action: 'List account transactions',
			},
			{
				name: 'Get Attachments',
				value: 'getAttachments',
				description: 'List all attachments for an account',
				action: 'List account attachments',
			},
			{
				name: 'Get Piggy Banks',
				value: 'getPiggyBanks',
				description: 'List all piggy banks related to an account',
				action: 'List account piggy banks',
			},
			{
				name: 'List Accounts',
				value: 'listAccounts',
				description: 'Returns a list of all the accounts owned by the authenticated user',
				action: 'List all accounts',
			},
			{
				name: 'Create Account',
				value: 'createAccount',
				description: 'Create empty new account',
				action: 'Create an account',
			},
			{
				name: 'Get Account',
				value: 'getAccount',
				description: 'Retrieve details of a single account',
				action: 'Get a single account',
		},
		{
				name: 'Update Account',
				value: 'updateAccount',
				description: 'Update an existing account',
				action: 'Update an account',
		},
		{
				name: 'Delete Account',
				value: 'deleteAccount',
				description: 'Delete an account',
				action: 'Delete an account',
		},
	],
	default: 'listAccounts',
	},
];

// Fields for the Accounts resource
export const accountsFields: INodeProperties[] = [

	// ----------------------------------
	//       Shared Main Fields
	// ----------------------------------
	// [ Account ID ] Get Account && Delete Account && Get Transactions && Get Attachments && Get Piggy Banks
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the account',
		displayOptions: {
				show: {
						resource: ['accounts'],
						operation: ['getAccount', 'updateAccount', 'deleteAccount',
												'getTransactions', 'getAttachments', 'getPiggyBanks'],
				},
		},
	},

	// ----------------------------------
	//      Get Account Transactions
	// ----------------------------------
	{
		displayName: 'Transaction Type',
		name: 'transactionsType',
		type: 'options',
		options: [
			{ name: '--', value: '', description: 'No filter' },
			{ name: 'All', value: 'all' },
			{ name: 'Withdrawal', value: 'withdrawal' },
			{ name: 'Withdrawals', value: 'withdrawals' },
			{ name: 'Expense', value: 'expense' },
			{ name: 'Deposit', value: 'deposit' },
			{ name: 'Deposits', value: 'deposits' },
			{ name: 'Income', value: 'income' },
			{ name: 'Transfer', value: 'transfer' },
			{ name: 'Transfers', value: 'transfers' },
			{ name: 'Opening Balance', value: 'opening_balance' },
			{ name: 'Reconciliation', value: 'reconciliation' },
			{ name: 'Special', value: 'special' },
			{ name: 'Specials', value: 'specials' },
			{ name: 'Default', value: 'default' },
		],
		default: '',
		description: 'Type of transactions returned',
		displayOptions: {
			show: {
				resource: ['accounts'],
				operation: ['getTransactions'],
			},
		},
	},

	// ----------------------------------
	//      	 List Accounts
	// ----------------------------------
	{
			displayName: 'Account Type',
			name: 'accountType',
			type: 'options',
			options: [
				{ name: '--', value: '', description: 'No filter' },
				{ name: 'All', value: 'all' },
				{ name: 'Asset', value: 'asset' },
				{ name: 'Beneficiary', value: 'Beneficiary account' },
				{ name: 'Cash', value: 'cash' },
				{ name: 'Debt', value: 'Debt' },
				{ name: 'Default', value: 'Default account' },
				{ name: 'Expense', value: 'expense' },
				{ name: 'Hidden', value: 'hidden' },
				{ name: 'Import', value: 'Import account' },
				{ name: 'Initial Balance', value: 'Initial balance account' },
				{ name: 'Liability', value: 'liability' },
				{ name: 'Loan', value: 'Loan' },
				{ name: 'Mortgage', value: 'Mortgage' },
				{ name: 'Reconciliation', value: 'Reconciliation account' },
				{ name: 'Revenue', value: 'revenue' },
				{ name: 'Special', value: 'special' },
			],
			default: '',
			description: 'Filter accounts by type',
			displayOptions: {
					show: {
							resource: ['accounts'],
							operation: ['listAccounts'],
					},
			},
	},

	// ----------------------------------
	//      	 Create Account
	// ----------------------------------
	{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			default: '',
			required: true,
			description: 'The name of the new account',
			displayOptions: {
					show: {
							resource: ['accounts'],
							operation: ['createAccount'],
					},
			},
	},
	{
			displayName: 'Account Type',
			name: 'type',
			type: 'options',
			options: [
					{ name: 'Asset', value: 'asset' },
					{ name: 'Expense', value: 'expense' },
					{ name: 'Import', value: 'import' },
					{ name: 'Revenue', value: 'revenue' },
					{ name: 'Cash', value: 'cash' },
					{ name: 'Liability', value: 'liability' },
					{ name: 'Liabilities', value: 'liabilities' },
					{ name: 'Initialbalance', value: 'initial-balance' },
					{ name: 'Reconciliation', value: 'reconciliation' },
			],
			default: 'asset',
			required: true,
			description: 'The type of the account',
			displayOptions: {
					show: {
							resource: ['accounts'],
							operation: ['createAccount'],
					},
			},
	},

	// ----------------------------------
	//      	 Update Account
	// ----------------------------------
	...updateAccountFields,


	// ----------------------------------
	//    Shared Optional Collections
	// ----------------------------------

	// Pagination Options
	{
    displayName: 'Pagination Options',
    name: 'paginationOptions',
    type: 'collection',
    placeholder: 'Add Pagination Options',
    default: {},
    displayOptions: {
        show: {
            resource: ['accounts'],
            operation: ['listAccounts', 'getTransactions',
												'getAttachments', 'getPiggyBanks'],
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

	// Date Range Filter
	{
    displayName: 'Date Range Filters',
    name: 'dateRangeFilters',
    type: 'collection',
    placeholder: 'Add Date Range Filters',
    default: {},
    displayOptions: {
        show: {
            resource: ['accounts'],
            operation: ['getTransactions'],
        },
    },
    options: [
        {
            displayName: 'Start Date',
            name: 'start',
            type: 'string',
            default: '',
            description: 'Filter results starting from this date (YYYY-MM-DD)',
        },
        {
            displayName: 'End Date',
            name: 'end',
            type: 'string',
            default: '',
            description: 'Filter results up to this date (YYYY-MM-DD)',
        },
    ],
},

	// Account Balance Date Filter
	{
    displayName: 'Account Balance Date',
    name: 'accountBalanceDate',
    type: 'collection',
    placeholder: 'Add Account Balance Date',
    default: {},
    displayOptions: {
        show: {
            resource: ['accounts'],
            operation: ['listAccounts'], // Only this?
        },
    },
    options: [
        {
            displayName: 'Date',
            name: 'date',
            type: 'string',
            default: '',
            description: 'A date formatted YYYY-MM-DD. When added to the request, Firefly III will show the account\'s balance on that day.',
        },
    ],
},
];
