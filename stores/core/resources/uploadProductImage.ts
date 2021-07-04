import { v4 as uuid } from 'uuid';
import { BlockBlobClient } from '@azure/storage-blob';
import { getConfiguration } from '../getConfiguration';

const productImagesContainer = 'product-images';

export async function uploadProductImage(productId: string, image: Buffer, type: string): Promise<string> {
  const { RESOURCES_STORAGE_ACCOUNT_CONNECTION_STRING: connectionString } = await getConfiguration();

  const productImageId = uuid();
  const blobName = `${productId}/${productImageId}`;

  const blobClient = new BlockBlobClient(connectionString, productImagesContainer, blobName);
  await blobClient.uploadData(image, {
    blobHTTPHeaders: {
      blobContentType: type,
    },
  });

  return `/${productImagesContainer}/${blobName}`;
}
