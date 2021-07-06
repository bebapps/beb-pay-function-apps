import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { mapStore, Store } from '../core/models/Store';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const STORE = createSuccessResponse(
  'STORE_RETRIEVED',
  'Retrieved store.',
);

const FAILED_TO_LOAD_STORE = createErrorResponse(
  'STORES_FAILED_TO_LOAD_STORE',
  'An unknown error occurred while attempting to retrieve store. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const { storeId } = req.params;

  const userId = await getUserIdFromRequest(req, false);

  const { stores } = await getDatabase();
  const { resource: storeResource } = await stores.item(storeId, storeId).read<Store>();

  const isUser = userId !== null && storeResource.userIds.includes(userId);
  const isStoreActive = storeResource.status === 'active';

  if (isUser || isStoreActive) {
    return STORE({
      store: mapStore(storeResource),
    });
  }

  return FAILED_TO_LOAD_STORE();
};
