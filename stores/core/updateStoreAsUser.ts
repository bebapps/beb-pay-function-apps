import { Resource } from '@azure/cosmos';
import { doesUserBelongToStore } from './auth/doesUserBelongToStore';
import { getDatabase } from './getDatabase';
import { Store } from './models/Store';
import { HttpResponse } from './responses/createResponse';
import * as sharedResponses from './responses/shared';

export async function updateStoreAsUser(
  storeId: string,
  userId: string,
  updater: (store: Store & Resource, isRetry: boolean) => Promise<false | any> | (false | any),
  responses: {
    success: (data: any) => HttpResponse;
    failure: () => HttpResponse;
    notFound?: () => HttpResponse;
    noPermission?: () => HttpResponse;
  },
) {
  const [belongsToStore] = await doesUserBelongToStore(userId, storeId);

  if (!belongsToStore) {
    return responses.noPermission?.() ?? sharedResponses.NO_PERMISSION();
  }

  const { stores } = await getDatabase();
  const storeItem = stores.item(storeId, storeId);

  let attempts = 1;

  while (true) {
    const { statusCode, resource: storeResource } = await storeItem.read<Store>();

    if (statusCode === 404) {
      return responses.notFound?.() ?? sharedResponses.NOT_FOUND();
    }

    try {
      const result = await updater(storeResource, attempts > 1);

      if (result === false) {
        break;
      }

      storeResource.lastUpdatedBy = userId;
      storeResource.lastUpdatedDate = new Date().toISOString();

      await storeItem.replace(storeResource, {
        accessCondition: {
          condition: storeResource._etag,
          type: 'IfMatch',
        },
      });

      return responses.success(result);
    } catch (err) {
      console.log(err);

      if (err.code === 412) { // Precondition failure
        attempts++;
        continue; // Retry
      }

      return responses.failure();
    }
  }

  return responses.failure();
}
