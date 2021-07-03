import { Resource } from '@azure/cosmos';
import { getDatabase } from '../getDatabase';
import { Store } from '../models/Store';

export async function doesUserBelongToStore(userId: string, storeId: string): Promise<([true, Store & Resource] | [false, null])> {
  const { stores } = await getDatabase();

  const { resources: [store] } = await stores.items.query<Store & Resource>({
    query: `SELECT * FROM c WHERE c.id = @storeId AND ARRAY_CONTAINS(c.userIds, @userId)`,
    parameters: [
      { name: '@storeId', value: storeId },
      { name: '@userId', value: userId },
    ],
  }).fetchAll();

  if (!store) {
    return [false, null];
  }

  return [true, store];
}
