# Money Book

Money Book API is the backend engine that manages transactions and calculate monthly expenses. The initial version of the engine is designed to be lightweight and quick to set up. Future ideas:

- Authentication and user management
- Dashboard and graphs
- Grouping transactions by book
- Workers to scrap and import banking data from external sources
- Auto monthly summary to be emailed to designated users

## Installation

1. `yarn install`.
2. `cp .example-env .env` and then edit the settings.
3. `yarn dev` for development.
4. `yarn build && yarn start` for production.

## Config

The following env vars are used to config the server. If a ".env" file exists, it will be used.

HOST: "0.0.0.0"
PORT: "50420"
MONGO_URI: ""
MONGO_DB_NAME: "moneybook"
MONGO_SSL_CA: ""
NODE_ENV: ""

# Docker Compose

You can quickly run this server with mongodb using docker-compose:
```docker-compose up```