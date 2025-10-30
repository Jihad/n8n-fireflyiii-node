/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { fireflyApiRequest } from './utils/ApiRequest';
import { aboutOperations, aboutFields } from './actions/about/about.resource';
import { accountsOperations, accountsFields } from './actions/accounts/accounts.resource';
import {
	searchFields,
	insightsFields,
	generalOperations,
	exportFields,
} from './actions/general/general.resource';
import { categoriesFields, categoriesOperations } from './actions/categories/categories.resource';
import { tagsFields, tagsOperations } from './actions/tags/tags.resource';
import {
	transactionsFields,
	transactionsOperations,
} from './actions/transactions/transactions.resource';
import {
	rulesAndGroupsFields,
	rulesAndGroupsOperations,
} from './actions/rules/rulesAndGroups.resource';
import { billsOperations, billsFields } from './actions/bills/bills.resource';
import { budgetsOperations, budgetsFields } from './actions/budgets/budgets.resource';
import { piggyBanksOperations, piggyBanksFields } from './actions/piggyBanks/piggyBanks.resource';
import { fireflyApiRequestV2 } from './utils/ApiRequestV2';

// Helper Function: Handle Create and Update Transactions
async function handleTransaction(
	this: IExecuteFunctions,
	method: 'POST' | 'PUT',
	endpoint: string,
	i: number,
): Promise<IDataObject> {
	// Change to return a single object
	const transactionSettings = this.getNodeParameter('transactionSettings', i, {}) as IDataObject;
	const transactionsData = this.getNodeParameter('transactionsData', i, {}) as IDataObject;

	// Extract and structure transactions array properly
	const transactionsArray = ((transactionsData.transaction as IDataObject[]) || []).map(
		(transaction) => {
			const transactionFields = transaction.transactionFields as IDataObject;

			// Parse tags from comma-separated string to an array
			if (transactionFields.tags && typeof transactionFields.tags === 'string') {
				transactionFields.tags = transactionFields.tags.split(',').map((tag) => tag.trim());
			}

			return transactionFields;
		},
	);

	// Prepare payload
	const body = {
		...transactionSettings,
		transactions: transactionsArray,
	};

	// Make the API request
	const response = await fireflyApiRequest.call(this, {
		method,
		endpoint,
		body,
	});

	return response; // Return the API response as a single object
}
// Helper Function: Handle Comma Separated String to Array[integer]
function parseCommaSeparatedFields(fields: { [key: string]: string }): IDataObject {
	const parsedFields: IDataObject = {};

	for (const [key, value] of Object.entries(fields)) {
		if (value) {
			parsedFields[`${key}`] = value.split(',').map((item) => item.trim());
		}
	}

	return parsedFields;
}

export class Fireflyiii implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FireFly III',
		name: 'fireflyiii',
		icon: 'file:fireflyiii.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Read, update, write and delete data using the powerful FireFly III API',
		defaults: {
			name: 'FireFly III',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'fireflyiiiOAuth2Api',
				required: true,
			},
		],
		properties: [
			// General Info Notice TO SHOW ON TOP to check API Docs
			{
				displayName:
					'Check out the amazing <a href="https://api-docs.firefly-iii.org/#/" target="_blank">API Documentation Site</a> to learn more.',
				name: 'Tip',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					// Search resource
					{
						name: 'General',
						value: 'general',
						description: 'Endpoints for search, Insights and Export APIs',
						hint: 'Check https://docs.firefly-iii.org/how-to/firefly-iii/features/search/ for more information on search',
					},
					// About resource
					{
						name: 'About API',
						value: 'about',
						description:
							'Endpoints deliver general system information, version- and meta information',
					},
					// Accounts resource
					{
						name: 'Accounts API',
						value: 'accounts',
						description:
							"Endpoints deliver all of the user's asset, expense and other CRUD operations by Account",
					},
					// Bills resource
					{
						name: 'Bills API',
						value: 'bills',
						description: "Endpoints deliver all of the user's bills and CRUD operations by Bill",
					},
					// Budgets resource
					{
						name: 'Budgets API',
						value: 'budgets',
						description:
							"Endpoints deliver all of the user's budgets, budget limits, and CRUD operations",
					},
					// Transactions resource
					{
						name: 'Transactions API',
						value: 'transactions',
						description: 'One endpoint to rule them all. All transaction related endpoints.',
					},
					// Categories resource
					{
						name: 'Categories API',
						value: 'categories',
						description:
							"Endpoints deliver all of the user's categories and CRUD operations by Category",
					},
					// Tags resource
					{
						name: 'Tags API',
						value: 'tags',
						description: "Endpoints deliver all of the user's tags and CRUD operations by Tag",
					},
					// Rules and Groups resource
					{
						name: 'Rules & Groups API',
						value: 'rulesAndGroups',
						description: 'Endpoints for rules and rule groups',
					},
					// Piggy Banks resource
					{
						name: 'Piggy Banks API',
						value: 'piggyBanks',
						description: 'Endpoints to manage piggy banks and savings goals',
					},
				],
				default: 'about',
			},
			// Operations for the selected resource
			...generalOperations,
			...aboutOperations,
			...accountsOperations,
			...billsOperations,
			...transactionsOperations,
			...categoriesOperations,
			...budgetsOperations,
			...tagsOperations,
			...rulesAndGroupsOperations,
			...piggyBanksOperations,
			// Global optional X-Trace-ID header for all requests
			{
				displayName: 'X-Trace-ID',
				name: 'xTraceId',
				type: 'string',
				default: '',
				description: 'A unique UUID identifier for the request, used for debugging and tracing',
				placeholder: '123e4567-e89b-12d3-a456-426614174000',
			},
			// show for operations
			...searchFields,
			...insightsFields,
			...exportFields,
			...aboutFields,
			...accountsFields,
			...budgetsFields,
			...billsFields,
			...transactionsFields,
			...categoriesFields,
			...tagsFields,
			...rulesAndGroupsFields,
			...piggyBanksFields,
		],
	};

	// Logic for Execution
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			// Execution logic for different resources and operations
			// ----------------------------------
			//             General APIs
			// ----------------------------------
			if (resource === 'general') {
				if (operation === 'searchAll') {
					const searchFor = this.getNodeParameter('searchFor', i) as string;
					const queryString = this.getNodeParameter('queryString', i) as string;

					// Add account-specific fields if available
					const accountType = this.getNodeParameter('type', i, '') as string;
					const searchField = this.getNodeParameter('searchField', i, '') as string;

					// Get pagination options (page, limit, etc.) and include them in the query
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/search/${searchFor}`,
						query: {
							type: accountType,
							field: searchField,
							query: queryString,
							...paginationOptions,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getInsights') {
					// Get "Insights On" & "Group By" values for the API endpoint
					const insightScope = this.getNodeParameter('insight', i) as string;
					const groupBy = this.getNodeParameter('groupBy', i, '') as string;

					// Get date range filters
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

					// Collect all optional filters
					const optionalFilters = {
						accounts: this.getNodeParameter('accounts', i, ['']) as string,
						categories: this.getNodeParameter('categories', i, '') as string,
						tags: this.getNodeParameter('tags', i, '') as string,
						bills: this.getNodeParameter('bills', i, '') as string,
						budgets: this.getNodeParameter('budgets', i, '') as string,
					};

					// Parse comma separated optional filters to array[integer]
					const parsedFilters = parseCommaSeparatedFields(optionalFilters);

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/insight/${insightScope}/${groupBy}`,
						query: {
							...dateRangeFilters,
							...parsedFilters,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'exportData') {
					const exportType = this.getNodeParameter('exportType', i) as string;
					const exportFormat = this.getNodeParameter('format', i, '') as string;

					const start = this.getNodeParameter('start', i, '') as string;
					const end = this.getNodeParameter('end', i, '') as string;

					const accountsInput = this.getNodeParameter('accounts', i, '') as string;

					const response = await fireflyApiRequestV2.call(
						this,
						'GET',
						`/data/export/${exportType}`,
						{},
						{
							type: exportFormat,
							start,
							end,
							accounts: accountsInput,
						},
						undefined,
						{ encoding: null, resolveWithFullResponse: true },
					);

					// console.log('Response Body?:', response.body);
					// console.log('Response Headers:', response.headers);
					// console.log('Response Object:', response);

					// Extract filename from headers
					let fileName = 'export.csv';
					if (response.headers['content-disposition']) {
						const match = response.headers['content-disposition'].match(/filename=(.+)/);
						if (match) {
							fileName = match[1];
						}
					}
					// Prepare binary data
					const binaryData = await this.helpers.prepareBinaryData(response.body, fileName);

					returnData.push({
						json: {},
						binary: {
							data: binaryData,
						},
					});
				}
			}
			// ----------------------------------
			//             About API
			// ----------------------------------
			else if (resource === 'about') {
				if (operation === 'getSystemInfo') {
					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/about',
					});
					returnData.push({ json: response });
				} else if (operation === 'getUserInfo') {
					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/about/user',
					});
					returnData.push({ json: response });
				} else if (operation === 'runCronJobs') {
					const cliToken = this.getNodeParameter('cliToken', i) as string;

					const additionalOptions = this.getNodeParameter(
						'additionalOptions',
						i,
						{},
					) as IDataObject;

					// Dynamically build query parameters
					const query: IDataObject = {};
					if (additionalOptions.date) {
						query.date = additionalOptions.date; // Add only if a value exists
					}
					if (additionalOptions.force) {
						query.force = additionalOptions.force; // Add only if true (or any meaningful value)
					}

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/cron/${cliToken}`,
						query,
					});

					returnData.push({ json: response });
				}
			}
			// ----------------------------------
			//             Accounts API
			// ----------------------------------
			else if (resource === 'accounts') {
				if (operation === 'getTransactions') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
					const transactionsType = this.getNodeParameter('transactionsType', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/accounts/${accountId}/transactions`,
						query: {
							...paginationOptions,
							...dateRangeFilters,
							type: transactionsType,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getAttachments') {
					const accountId = this.getNodeParameter('accountId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/accounts/${accountId}/attachments`,
					});
					returnData.push({ json: response });
				} else if (operation === 'getPiggyBanks') {
					const accountId = this.getNodeParameter('accountId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/accounts/${accountId}/piggy-banks`,
					});
					returnData.push({ json: response });
				} else if (operation === 'listAccounts') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
					const accountType = this.getNodeParameter('accountType', i) as string;
					const accountBalanceDate = this.getNodeParameter('accountBalanceDate', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/accounts',
						query: {
							type: accountType,
							date: accountBalanceDate,
							...paginationOptions,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'createAccount') {
					const name = this.getNodeParameter('name', i) as string;
					const type = this.getNodeParameter('type', i) as string;
					const accountFields = this.getNodeParameter('accountFields', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'POST',
						endpoint: '/accounts',
						body: {
							name,
							type,
							...accountFields,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getAccount') {
					const accountId = this.getNodeParameter('accountId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/accounts/${accountId}`,
					});
					returnData.push({ json: response });
				} else if (operation === 'updateAccount') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const updateFields = this.getNodeParameter('accountFields', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'PUT',
						endpoint: `/accounts/${accountId}`,
						body: updateFields,
					});
					returnData.push({ json: response });
				} else if (operation === 'deleteAccount') {
					const accountId = this.getNodeParameter('accountId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/accounts/${accountId}`,
					});
					returnData.push({ json: response });
				}
			}
			// ----------------------------------
			//             Bills API
			// ----------------------------------
			else if (resource === 'bills') {
				if (operation === 'listBills') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
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
				} else if (operation === 'getBill') {
					const billId = this.getNodeParameter('billId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/bills/${billId}`,
					});
					returnData.push({ json: response });
				} else if (operation === 'createBill') {
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
				} else if (operation === 'updateBill') {
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
				} else if (operation === 'deleteBill') {
					const billId = this.getNodeParameter('billId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/bills/${billId}`,
					});
					returnData.push({ json: response });
				} else if (operation === 'getAttachments') {
					const billId = this.getNodeParameter('billId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/bills/${billId}/attachments`,
						query: {
							...paginationOptions,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getRules') {
					const billId = this.getNodeParameter('billId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/bills/${billId}/rules`,
						query: {
							...paginationOptions,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getTransactions') {
					const billId = this.getNodeParameter('billId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
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
			}
			// ----------------------------------
			//             Budgets API
			// ----------------------------------
			else if (resource === 'budgets') {
				// Budget CRUD Operations
				if (operation === 'listBudgets') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/budgets',
						query: {
							...paginationOptions,
							...dateRangeFilters,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getBudget') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/budgets/${budgetId}`,
						query: {
							...dateRangeFilters,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'createBudget') {
					const name = this.getNodeParameter('name', i) as string;
					const budgetFields = this.getNodeParameter('budgetFields', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'POST',
						endpoint: '/budgets',
						body: {
							name,
							...budgetFields,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'updateBudget') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'PUT',
						endpoint: `/budgets/${budgetId}`,
						body: updateFields,
					});
					returnData.push({ json: response });
				} else if (operation === 'deleteBudget') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/budgets/${budgetId}`,
					});
					returnData.push({ json: response });
				}
				// Budget Limit Operations
				else if (operation === 'listBudgetLimits') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/budgets/${budgetId}/limits`,
						query: {
							...dateRangeFilters,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'createBudgetLimit') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const amount = this.getNodeParameter('amount', i) as string;
					const start = this.getNodeParameter('start', i) as string;
					const end = this.getNodeParameter('end', i) as string;
					const budgetLimitFields = this.getNodeParameter(
						'budgetLimitFields',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'POST',
						endpoint: `/budgets/${budgetId}/limits`,
						body: {
							amount,
							start,
							end,
							budget_id: budgetId,
							...budgetLimitFields,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getBudgetLimit') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const budgetLimitId = this.getNodeParameter('budgetLimitId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/budgets/${budgetId}/limits/${budgetLimitId}`,
					});
					returnData.push({ json: response });
				} else if (operation === 'updateBudgetLimit') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const budgetLimitId = this.getNodeParameter('budgetLimitId', i) as string;
					const updateLimitFields = this.getNodeParameter(
						'updateLimitFields',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'PUT',
						endpoint: `/budgets/${budgetId}/limits/${budgetLimitId}`,
						body: updateLimitFields,
					});
					returnData.push({ json: response });
				} else if (operation === 'deleteBudgetLimit') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const budgetLimitId = this.getNodeParameter('budgetLimitId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/budgets/${budgetId}/limits/${budgetLimitId}`,
					});
					returnData.push({ json: response });
				}
				// Additional Operations
				else if (operation === 'getTransactions') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
					const transactionType = this.getNodeParameter('transactionType', i, 'all') as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/budgets/${budgetId}/transactions`,
						query: {
							...paginationOptions,
							...dateRangeFilters,
							type: transactionType === 'all' ? undefined : transactionType,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getAttachments') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/budgets/${budgetId}/attachments`,
						query: {
							...paginationOptions,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getLimitTransactions') {
					const budgetId = this.getNodeParameter('budgetId', i) as string;
					const budgetLimitId = this.getNodeParameter('budgetLimitId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
					const transactionType = this.getNodeParameter('transactionType', i, 'all') as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/budgets/${budgetId}/limits/${budgetLimitId}/transactions`,
						query: {
							...paginationOptions,
							...dateRangeFilters,
							type: transactionType === 'all' ? undefined : transactionType,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'listAllBudgetLimits') {
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

					// Validate required fields
					if (!dateRangeFilters.start || !dateRangeFilters.end) {
						throw new NodeOperationError(
							this.getNode(),
							'Start and end dates are required for listAllBudgetLimits operation',
						);
					}

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/budget-limits',
						query: {
							...dateRangeFilters,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getTransactionsWithoutBudget') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
					const transactionType = this.getNodeParameter('transactionType', i, 'all') as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/budgets/transactions-without-budget',
						query: {
							...paginationOptions,
							...dateRangeFilters,
							type: transactionType === 'all' ? undefined : transactionType,
						},
					});
					returnData.push({ json: response });
				}
			}
			// ----------------------------------
			//             Categories API
			// ----------------------------------
			else if (resource === 'categories') {
				if (operation === 'listCategories') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/categories',
						query: {
							...paginationOptions,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'createCategory') {
					const name = this.getNodeParameter('name', i) as string;
					const notes = this.getNodeParameter('notes', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'POST',
						endpoint: '/categories',
						body: {
							name,
							notes,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getCategory') {
					const categoryId = this.getNodeParameter('categoryId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/categories/${categoryId}`,
					});
					returnData.push({ json: response });
				} else if (operation === 'updateCategory') {
					const categoryId = this.getNodeParameter('categoryId', i) as string;
					const name = this.getNodeParameter('name', i) as string;
					const notes = this.getNodeParameter('notes', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'PUT',
						endpoint: `/categories/${categoryId}`,
						body: {
							name,
							notes,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'deleteCategory') {
					const categoryId = this.getNodeParameter('categoryId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/categories/${categoryId}`,
					});
					returnData.push({ json: response });
				} else if (operation === 'getTransactionsByCategory') {
					const categoryId = this.getNodeParameter('categoryId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/categories/${categoryId}/transactions`,
						query: {
							...paginationOptions,
							...dateRangeFilters,
						},
					});
					returnData.push({ json: response });
				}
			}
			// ----------------------------------
			//             Tags API
			// ----------------------------------
			else if (resource === 'tags') {
				if (operation === 'listTags') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/tags',
						query: paginationOptions,
					});
					returnData.push({ json: response });
				} else if (operation === 'createTag') {
					const newName = this.getNodeParameter('name', i) as string;
					const extraOptions = this.getNodeParameter('extraOptions', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'POST',
						endpoint: '/tags',
						body: {
							tag: newName,
							...extraOptions,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'getTag') {
					const tagNameId = this.getNodeParameter('tagNameId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/tags/${tagNameId}`,
					});
					returnData.push({ json: response });
				} else if (operation === 'updateTag') {
					const tagNameId = this.getNodeParameter('tagNameId', i) as string;
					const newName = this.getNodeParameter('name', i) as string;
					const extraOptions = this.getNodeParameter('extraOptions', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'PUT',
						endpoint: `/tags/${tagNameId}`,
						body: {
							tag: newName,
							...extraOptions,
						},
					});
					returnData.push({ json: response });
				} else if (operation === 'deleteTag') {
					const tagNameId = this.getNodeParameter('tagNameId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/tags/${tagNameId}`,
					});
					returnData.push({ json: response });
				} else if (operation === 'getTransactionsByTag') {
					const tagNameId = this.getNodeParameter('tagNameId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/tags/${tagNameId}/transactions`,
						query: {
							...paginationOptions,
							...dateRangeFilters,
						},
					});
					returnData.push({ json: response });
				}
			}
			// ----------------------------------
			//             Transactions API
			// ----------------------------------
			else if (resource === 'transactions') {
				if (operation === 'listTransactions') {
					const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					// Build query parameters
					const query: IDataObject = {
						type: filters.type || filters.customType,
						start: filters.start,
						end: filters.end,
						...paginationOptions,
					};

					// API Request
					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/transactions',
						query,
					});

					returnData.push({ json: response });
				} else if (operation === 'getTransaction') {
					const transactionId = this.getNodeParameter('transactionId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/transactions/${transactionId}`,
					});
					returnData.push({ json: response });
				} else if (operation === 'createTransaction') {
					const response = await handleTransaction.call(this, 'POST', '/transactions', i);
					returnData.push({ json: response });
				} else if (operation === 'updateTransaction') {
					const transactionId = this.getNodeParameter('transactionId', i) as string;
					const response = await handleTransaction.call(
						this,
						'PUT',
						`/transactions/${transactionId}`,
						i,
					);
					returnData.push({ json: response });
				} else if (operation === 'deleteTransaction') {
					const transactionId = this.getNodeParameter('transactionId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/transactions/${transactionId}`,
					});

					returnData.push({ json: response });
				} else if (operation === 'getAttachments') {
					const transactionId = this.getNodeParameter('transactionId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/transactions/${transactionId}/attachments`,
						query: {
							...paginationOptions,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'getPiggyBankEvents') {
					const transactionId = this.getNodeParameter('transactionId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/transactions/${transactionId}/piggy-bank-events`,
						query: {
							...paginationOptions,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'listTransactionLinks') {
					const transactionJournalId = this.getNodeParameter('transactionId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/transaction-journals/${transactionJournalId}/links`,
						query: {
							...paginationOptions,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'getTransactionJournal') {
					const transactionJournalId = this.getNodeParameter('transactionId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/transaction-journals/${transactionJournalId}`,
					});

					returnData.push({ json: response });
				} else if (operation === 'deleteTransactionSplit') {
					const transactionJournalId = this.getNodeParameter('transactionId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/transaction-journals/${transactionJournalId}`,
					});

					returnData.push({ json: response });
				}
			}
			// ----------------------------------
			//             Rules & Groups API
			// ----------------------------------
			else if (resource === 'rulesAndGroups') {
				// Rule Groups Operations
				if (operation === 'listGroups') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/rule-groups',
						query: {
							...paginationOptions,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'getGroup') {
					const ruleGroupId = this.getNodeParameter('ruleGroupId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/rule-groups/${ruleGroupId}`,
					});

					returnData.push({ json: response });
				} else if (operation === 'listGroupRules') {
					const ruleGroupId = this.getNodeParameter('ruleGroupId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/rule-groups/${ruleGroupId}/rules`,
						query: {
							...paginationOptions,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'testGroup') {
					const ruleGroupId = this.getNodeParameter('ruleGroupId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
					const testLimits = this.getNodeParameter('testLimits', i, {}) as IDataObject;
					const accountsInput = this.getNodeParameter('accounts', i, ['']) as string;

					// Parse comma separated accounts to array[integer]
					const parsedAcconuts = parseCommaSeparatedFields({ accounts: accountsInput });

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/rule-groups/${ruleGroupId}/test`,
						query: {
							...paginationOptions,
							...dateRangeFilters,
							...testLimits,
							...parsedAcconuts,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'triggerGroup') {
					const ruleGroupId = this.getNodeParameter('ruleGroupId', i) as string;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
					const accountsInput = this.getNodeParameter('accounts', i, ['']) as string;

					// Parse comma separated accounts to array[integer]
					const parsedAcconuts = parseCommaSeparatedFields({ accounts: accountsInput });

					const response = await fireflyApiRequest.call(this, {
						method: 'POST',
						endpoint: `/rule-groups/${ruleGroupId}/trigger`,
						body: {
							...dateRangeFilters,
							...parsedAcconuts,
						},
					});

					returnData.push({ json: response });
				}
				// Rule Operations
				else if (operation === 'listRules') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/rules',
						query: {
							...paginationOptions,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'getRule') {
					const ruleGroupId = this.getNodeParameter('ruleGroupId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/rules/${ruleGroupId}`,
					});

					returnData.push({ json: response });
				} else if (operation === 'testRule') {
					const ruleGroupId = this.getNodeParameter('ruleGroupId', i) as string;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
					const accountsInput = this.getNodeParameter('accounts', i, ['']) as string;

					// Parse comma separated accounts to array[integer]
					const parsedAcconuts = parseCommaSeparatedFields({ accounts: accountsInput });

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/rules/${ruleGroupId}/test`,
						query: {
							...dateRangeFilters,
							...parsedAcconuts,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'triggerRule') {
					const ruleGroupId = this.getNodeParameter('ruleGroupId', i) as string;
					const dateRangeFilters = this.getNodeParameter('dateRangeFilters', i, {}) as IDataObject;
					const accountsInput = this.getNodeParameter('accounts', i, ['']) as string;

					// Parse comma separated accounts to array[integer]
					const parsedAcconuts = parseCommaSeparatedFields({ accounts: accountsInput });

					const response = await fireflyApiRequest.call(this, {
						method: 'POST',
						endpoint: `/rules/${ruleGroupId}/trigger`,
						query: {
							...dateRangeFilters,
							...parsedAcconuts,
						},
					});

					returnData.push({ json: response });
				}
			}
			// ----------------------------------
			//         Piggy Banks
			// ----------------------------------
			else if (resource === 'piggyBanks') {
				if (operation === 'listPiggyBanks') {
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/piggy-banks',
						query: {
							...paginationOptions,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'getPiggyBank') {
					const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/piggy-banks/${piggyBankId}`,
					});

					returnData.push({ json: response });
				} else if (operation === 'createPiggyBank') {
					const name = this.getNodeParameter('name', i) as string;
					const targetAmount = this.getNodeParameter('targetAmount', i) as string;
					const startDate = this.getNodeParameter('startDate', i) as string;
					const currencyCode = this.getNodeParameter('currencyCode', i, '') as string;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
					const accountsData = this.getNodeParameter('accountsData', i, {}) as IDataObject;

					// Build the accounts array from fixedCollection
					const accountsArray = ((accountsData.account as IDataObject[]) || []).map((account) => {
						const accountObj: IDataObject = {};

						// Add all fields from the account object (already in snake_case from field definitions)
						if (account.account_id) {
							accountObj.account_id = account.account_id;
						}
						if (account.name) {
							accountObj.name = account.name;
						}
						if (account.current_amount) {
							accountObj.current_amount = account.current_amount;
						}

						return accountObj;
					});

					const body: IDataObject = {
						name,
						accounts: accountsArray,
						target_amount: targetAmount,
						start_date: startDate,
					};

					// Add currency code if provided (from main parameter)
					if (currencyCode) {
						body.transaction_currency_code = currencyCode;
					}
					// Add currency ID if provided (from additional fields as alternative)
					if (additionalFields.currencyId) {
						body.transaction_currency_id = additionalFields.currencyId;
					}

					// Handle other optional fields
					if (additionalFields.targetDate) {
						body.target_date = additionalFields.targetDate;
					}
					if (additionalFields.order !== undefined) {
						body.order = additionalFields.order;
					}
					if (additionalFields.notes) {
						body.notes = additionalFields.notes;
					}
					if (additionalFields.objectGroupId) {
						body.object_group_id = additionalFields.objectGroupId;
					}
					if (additionalFields.objectGroupTitle) {
						body.object_group_title = additionalFields.objectGroupTitle;
					}

					const response = await fireflyApiRequest.call(this, {
						method: 'POST',
						endpoint: '/piggy-banks',
						body,
					});

					returnData.push({ json: response });
				} else if (operation === 'updatePiggyBank') {
					const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;
					const updateAccountsData = this.getNodeParameter(
						'updateAccountsData',
						i,
						{},
					) as IDataObject;
					const updateName = this.getNodeParameter('updateName', i, '') as string;
					const updateTargetAmount = this.getNodeParameter('updateTargetAmount', i, '') as string;
					const updateStartDate = this.getNodeParameter('updateStartDate', i, '') as string;
					const updateCurrencyCode = this.getNodeParameter('updateCurrencyCode', i, '') as string;
					const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

					const body: IDataObject = {};

					// Build the accounts array from fixedCollection if provided
					if (
						updateAccountsData.account &&
						(updateAccountsData.account as IDataObject[]).length > 0
					) {
						const accountsArray = ((updateAccountsData.account as IDataObject[]) || []).map(
							(account) => {
								const accountObj: IDataObject = {};

								if (account.account_id) {
									accountObj.account_id = account.account_id;
								}
								if (account.name) {
									accountObj.name = account.name;
								}
								if (account.current_amount) {
									accountObj.current_amount = account.current_amount;
								}

								return accountObj;
							},
						);
						body.accounts = accountsArray;
					}

					// Add main fields if provided
					if (updateName) {
						body.name = updateName;
					}
					if (updateTargetAmount) {
						body.target_amount = updateTargetAmount;
					}
					if (updateStartDate) {
						body.start_date = updateStartDate;
					}

					// Add currency code if provided
					if (updateCurrencyCode) {
						body.transaction_currency_code = updateCurrencyCode;
					}

					// Add currency ID if provided (from additional fields as alternative)
					if (updateFields.currencyId) {
						body.transaction_currency_id = updateFields.currencyId;
					}

					// Handle other optional fields from additional fields
					if (updateFields.targetDate) {
						body.target_date = updateFields.targetDate;
					}
					if (updateFields.order !== undefined) {
						body.order = updateFields.order;
					}
					if (updateFields.notes) {
						body.notes = updateFields.notes;
					}
					if (updateFields.objectGroupId) {
						body.object_group_id = updateFields.objectGroupId;
					}
					if (updateFields.objectGroupTitle) {
						body.object_group_title = updateFields.objectGroupTitle;
					}

					const response = await fireflyApiRequest.call(this, {
						method: 'PUT',
						endpoint: `/piggy-banks/${piggyBankId}`,
						body,
					});

					returnData.push({ json: response });
				} else if (operation === 'deletePiggyBank') {
					const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;

					await fireflyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/piggy-banks/${piggyBankId}`,
					});

					returnData.push({ json: { success: true, id: piggyBankId } });
				} else if (operation === 'getEvents') {
					const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/piggy-banks/${piggyBankId}/events`,
						query: {
							...paginationOptions,
						},
					});

					returnData.push({ json: response });
				} else if (operation === 'getAttachments') {
					const piggyBankId = this.getNodeParameter('piggyBankId', i) as string;
					const paginationOptions = this.getNodeParameter(
						'paginationOptions',
						i,
						{},
					) as IDataObject;

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/piggy-banks/${piggyBankId}/attachments`,
						query: {
							...paginationOptions,
						},
					});

					returnData.push({ json: response });
				}
			}
		}
		return [returnData];
	}
}
