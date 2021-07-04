import { v4 as uuid } from 'uuid';
import { BlockBlobClient } from '@azure/storage-blob';
import { getConfiguration } from '../getConfiguration';

const storeLogosContainer = 'store-logos';

export async function uploadStoreLogo(image: Buffer, type: string): Promise<string> {
  const { RESOURCES_STORAGE_ACCOUNT_CONNECTION_STRING: connectionString } = await getConfiguration();

  const logoId = uuid();

  const blobClient = new BlockBlobClient(connectionString, storeLogosContainer, logoId);
  await blobClient.uploadData(image, {
    blobHTTPHeaders: {
      blobContentType: type,
    },
  });

  return `/${storeLogosContainer}/${logoId}`;
}
