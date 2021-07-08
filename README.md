# Beb Pay - Function Apps

This is the repo containing the Azure Function Apps that make up Beb Pay.

Sorry, no real documentation here.

## Environment variables

All configuration is propagated through the two services that make up Beb Pay using Azure App Configuration. That means the only environment variable needed to run the services is `APP_CONFIGURATION_CONNECTION_STRING`.

### App Configuration Configs

- `.sentinel`  
  The config used to check whether the service needs to update it's local copy of the configuration.

- `COSMOS_DB_CONNECTION_STRING`  
  The connection string for the Azure CosmosDB account.

- `EVENT_GRID_ENDPOINT`  
  The URL to the endpoint used to enqueue events to the Azure Event Grid topic (this isn't used in production as we ran out of time to implement webhook delivery).

- `JWT_SIGNING_SECRET`  
  The JWT signing secret used for authorization in the app.

- `PUBLIC_URL`  
  The public URL to the app (eg. https://beb-pay.bebapps.dev) - used to generate URLs in the app.

- `RAPYD_ACCESS_KEY`  
  The Beb Pay Rapid access key.

- `RAPYD_SECRET_KEY`  
  The Beb Pay Rapid secret key.

- `RESOURCES_STORAGE_ACCOUNT_CONNECTION_STRING`  
  The connection string for the Azure Storage account which holds all the files (store logos, product images) uploaded by users.

- `SENDGRID_API_KEY`  
  The Beb Pay SendGrid API key (this isn't used in production as we ran out of time to implement emails).