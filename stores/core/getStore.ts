import { Item, Resource } from '@azure/cosmos';
import { getDatabase } from './getDatabase';
import { Store } from './models/Store';

export async function getStore(storeId: string): Promise<[(Store & Resource) | null, Item]> {
  const { stores } = await getDatabase();

  const storeItem = stores.item(storeId, storeId);
  const { statusCode, resource: storeResource } = await storeItem.read<Store>();

  if (statusCode !== 200) {
    return [null, storeItem];
  }

  return [storeResource, storeItem];
}
