import type { INodeProperties } from 'n8n-workflow';

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
				name: 'Get Object Group',
				value: 'getObjectGroup',
				description: 'Retrieve a single object group',
				action: 'Get object group',
			},
			{
				name: 'Get Piggy Banks',
				value: 'getPiggyBanks',
				description: 'List all piggy banks in this object group',
				action: 'Get object group piggy banks',
			},
			{
				name: 'List Object Groups',
				value: 'listObjectGroups',
				description: 'Retrieve all object groups',
				action: 'List object groups',
			},
			{
				name: 'Update Object Group',
				value: 'updateObjectGroup',
				description: 'Update an existing object group',
				action: 'Update object group',
			},
		],
		default: 'listObjectGroups',
	},
];

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
		displayName: 'Update Fields',
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
