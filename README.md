# n8n Firefly III Node

This repository contains a custom node for [n8n](https://n8n.io/), an open-source workflow automation tool. The node integrates with [Firefly III](https://www.firefly-iii.org/), a self-hosted personal finance manager.

It might not be the most advanced n8n node, built it for me while learning - so feel free to take it forward if needed.

## Features

Many of Firefly III endpoints implemented, including transactions, search and export - I believe it could help building many interesting workflows in n8n that automates finanance management even more.

## Supported Endpoints

This node supports many of Firefly III API endpoints, such as:

- **/api/v1/transactions**: Create, list, update, and delete transactions.
- **/api/v1/accounts**: Retrieve, create, update, and delete account details.
- **/api/v1/bills**: Manage bills with full CRUD operations, attachments, rules, and transaction tracking.
- **/api/v1/budgets**: Fetch budget information.
- **/api/v1/categories**: List, create, update, and delete categories.
- **/api/v1/tags**: Retrieve, create, update, and delete tags.
- **/api/v1/attachments**: Upload and manage attachments.
- **/api/v1/recurrences**: Handle recurring transactions.
- **/api/v1/rules**: Manage rules and rule groups.
- **/api/v1/piggy_banks**: Retrieve and manage piggy banks.
- **/api/v1/preferences**: Fetch user preferences.
- **/api/v1/about**: Retrieve system and user information.
- **/api/v1/cron**: Run cron jobs.

Note: it doesn't do crazy things, mostly one-to-one endpoint mapping, feel free to clone repo and do what you must.

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
