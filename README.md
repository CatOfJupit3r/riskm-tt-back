# Risk Management Solutions - BackEND

This repo contain code for server side of Risk Management Solutions project.

## Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/CatOfJupit3r/riskm-tt-back.git
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory of the project and populate it with the variables from `.env.example`.
   

## Environment Variables

The following environment variables are required for the application to run:

```dotenv
MONGO_URL= # URL of the MongoDB database
SERVER_PORT= # Port on which the server will run
HYDRATION_TYPE= # 'TEST' OR 'DEVELOPMENT' OR 'PRODUCTION'
NODE_ENV= # 'test' OR 'development' OR 'production'. if set to 'test' or 'development', then GraphQL will omit stacktrace in error response
```

This ensures that any changes to the schema on the backend are reflected in the frontend.

But when committing changes, remember to not include these changes in the commit.

## Hydration Modes

The application has three modes of database hydration:
- `TEST` - This mode overrides all the data in the database with the data from `src/mocks/test.json` file. This is useful for testing purposes.
- `PRODUCTION` - This mode is used in production. It overrides the data in the database with the data from `src/mocks/prod.json` file. This is useful for testing if the application is working as expected in production.
- `DEVELOPMENT` - This mode is used for development. If your database is empty, then it will add new data from `src/mocks/test.json`. Otherwise, it will keep the data in the database as is.
- any other - This means that application will not override the data in the database with the data from the mock files and will run as is.
