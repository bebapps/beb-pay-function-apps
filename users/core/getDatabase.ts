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

  const { container: users } = await database.containers.createIfNotExists({
    id: 'users',
    partitionKey: {
      paths: ['/email'],
      version: 2,
    },
    uniqueKeyPolicy: {
      uniqueKeys: [
        { paths: ['/email'] },
      ],
    },
  });

  return {
    users,
  };
}

export async function getDatabase() {
  return client;
}
