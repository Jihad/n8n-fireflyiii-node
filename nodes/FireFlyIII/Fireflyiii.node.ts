/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */
import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
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
				],
				default: 'about',
			},
			// Operations for the selected resource
			...generalOperations,
			...aboutOperations,
			...accountsOperations,
			...transactionsOperations,
			...categoriesOperations,
			...tagsOperations,
			...rulesAndGroupsOperations,
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
			...transactionsFields,
			...categoriesFields,
			...tagsFields,
			...rulesAndGroupsFields,
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

					const response = await fireflyApiRequest.call(this, {
						method: 'GET',
						endpoint: `/search/${searchFor}`,
						query: {
							type: accountType,
							field: searchField,
							query: queryString,
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
					const binaryData = await this.helpers.prepareBinaryData(
						response.body, fileName,
					);

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
		}
		return [returnData];
	}
}
