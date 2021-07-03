import { BlobSASPermissions, BlockBlobClient } from '@azure/storage-blob';
import ms from 'ms';
import { storageAccountConnectionString } from './storageAccountConnectionString';

const urlTtl = ms('1 day');

export async function getUrlFromResourcePath(resourcePath: string) {
  const containerIndex = resourcePath.indexOf('/', 1);
  const containerName = resourcePath.substring(1, containerIndex);
  const blobName = resourcePath.substring(containerIndex + 1);

  const connectionString = await storageAccountConnectionString;
  const blobClient = new BlockBlobClient(connectionString, containerName, blobName);
  const url = await blobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse('r'),
    expiresOn: new Date(Date.now() + urlTtl),
  });

  return url;
}
