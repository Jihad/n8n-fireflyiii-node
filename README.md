# n8n Firefly III Node

This repository contains a custom node for [n8n](https://n8n.io/), an open-source workflow automation tool. The node integrates with [Firefly III](https://www.firefly-iii.org/), a self-hosted personal finance manager.

It might not be the most advanced n8n node, built it for me while learning - so feel free to take it forward if needed.

## Features

Many of Firefly III endpoints implemented, including transactions, search and export - I believe it could help building many interesting workflows in n8n that automates finanance management even more.

## Supported Endpoints

This node supports the following Firefly III API endpoints:

### General Operations
- **/api/v1/about** (3 operations): System information, user information, and cron jobs.
- **/api/v1/search** (1 operation): Search across all resources.
- **/api/v1/insight** (1 operation): Retrieve spending insights.
- **/api/v1/data/export** (1 operation): Export data.
- **/api/v1/available-budgets** (2 operations): List and retrieve available budgets.

### Financial Control Resources
- **/api/v1/budgets** (15 operations): Full CRUD for budgets and budget limits, track spending, retrieve transactions.
- **/api/v1/piggy-banks** (7 operations): Full CRUD operations, manage events and attachments.
- **/api/v1/bills** (8 operations): Full CRUD operations, manage attachments, retrieve rules and transactions.

### Core Resources: Transaction and Automation
- **/api/v1/transactions** (6 operations): Create, list, get, update, delete transactions, and retrieve attachments.
- **/api/v1/rules** (14 operations): Full CRUD for rules and rule groups, test and trigger rules.
- **/api/v1/recurrences** (6 operations): Full CRUD for recurring transactions, trigger execution.

### Account & Classification Resources
- **/api/v1/accounts** (6 operations): Full CRUD operations, retrieve related transactions, piggy banks, and attachments.
- **/api/v1/categories** (6 operations): Full CRUD operations and retrieve category transactions.
- **/api/v1/tags** (7 operations): Full CRUD operations, retrieve transactions and attachments.
- **/api/v1/object-groups** (6 operations): List, get, update, delete groups and retrieve related bills/piggy banks.

**Total: 83+ operations across 14 API resources**

## Usage

1. Open your n8n instance.
2. Create a new workflow.
3. Add the Firefly III node to your workflow.
4. Configure the node with your Firefly III API credentials.
5. Select the desired operation (e.g., Create Transaction, Retrieve Accounts).
6. Execute the workflow to automate your personal finance tasks.

## Configuration

To use this node, you need to configure it with your Firefly III API credentials. You can obtain these credentials from your Firefly III instance.

1. Log in to your Firefly III instance.
2. Navigate to the API section.
3. Create a new API token.
4. Copy the token and paste it into the n8n Firefly III node configuration.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [n8n](https://n8n.io/)
- [Firefly III](https://www.firefly-iii.org/)
