import { CosmosClient } from '@azure/cosmos';
import { getConfiguration } from './getConfiguration';

const client = createDatabase();

async function createDatabase() {
  const { COSMOS_DB_CONNECTION_STRING } = await getConfiguration();
  const client = new CosmosClient(COSMOS_DB_CONNECTION_STRING);

  const { database } = await client.databases.createIfNotExists({
    id: 'beb-pay',
    throughput: 400,
  });

  const { container: stores } = await database.containers.createIfNotExists({
    id: 'stores',
    partitionKey: {
      paths: ['/id'],
      version: 1,
    },
  });

  const { container: storeProducts } = await database.containers.createIfNotExists({
    id: 'store-products',
    partitionKey: {
      paths: ['/storeId'],
      version: 1,
    },
  });

  return {
    stores,
    storeProducts,
  };
}

export async function getDatabase() {
  return client;
}
