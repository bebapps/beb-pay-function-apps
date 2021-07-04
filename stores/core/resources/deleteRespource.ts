import { BlockBlobClient } from '@azure/storage-blob';
import { getConfiguration } from '../getConfiguration';

const protectedContainers = [
  'sample-product-images',
];

export async function deleteResource(resourcePath: string): Promise<string> {
  const containerIndex = resourcePath.indexOf('/', 1);
  const containerName = resourcePath.substring(1, containerIndex);
  const blobName = resourcePath.substring(containerIndex + 1);

  if (protectedContainers.includes(containerName)) {
    return;
  }

  const { RESOURCES_STORAGE_ACCOUNT_CONNECTION_STRING: connectionString } = await getConfiguration();

  const blobClient = new BlockBlobClient(connectionString, containerName, blobName);
  await blobClient.deleteIfExists();
}
