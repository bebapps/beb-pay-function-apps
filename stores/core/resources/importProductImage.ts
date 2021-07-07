import fetch from 'node-fetch';
import { uploadProductImage } from './uploadProductImage';

export async function importProductImage(productId: string, url: string) {
  const response = await fetch(url);
  const contentType = response.headers.get('content-type');

  if (response.ok && contentType?.startsWith('image/')) {
    const image = await response.buffer();
    return uploadProductImage(productId, image, contentType);
  }
}
