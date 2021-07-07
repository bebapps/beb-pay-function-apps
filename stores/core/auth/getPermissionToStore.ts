import { getStore } from '../getStore';

export async function getPermissionToStore(storeId: string, userId: string | null) {
  const [store] = await getStore(storeId);

  if (userId !== null && store.userIds.includes(userId)) {
    return 'admin';
  }

  if (store.status === 'active') {
    return 'guest';
  }

  return null;
}
