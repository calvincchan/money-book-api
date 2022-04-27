# Money Book

Money Book API is the backend engine that manages transactions and calculate monthly expenses. The initial version of the engine is designed to be lightweight and quick to set up. Future ideas:

- Authentication and user management
- Dashboard and graphs
- Grouping transactions by book
- Workers to scrap and import banking data from external sources
- Auto monthly summary to be emailed to designated users

## Installation

1. `yarn install`.
2. `cp .env-example .env` and then adding the settings.
3. `yarn dev` for development.
4. `yarn build && yarn start` for production.