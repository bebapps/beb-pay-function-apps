import { Item, Resource } from '@azure/cosmos';
import { getDatabase } from './getDatabase';
import { StoreProduct } from './models/StoreProduct';

export async function getStoreProduct(storeId: string, productId: string): Promise<[(StoreProduct & Resource) | null, Item]> {
  const { storeProducts } = await getDatabase();

  const storeProductItem = storeProducts.item(productId, storeId);
  const { statusCode, resource: storeProductResource } = await storeProductItem.read<StoreProduct>();

  if (statusCode !== 200) {
    return [null, storeProductItem];
  }

  return [storeProductResource, storeProductItem];
}
