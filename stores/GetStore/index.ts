import { Context, HttpRequest } from '@azure/functions';
import { getPermissionToStore } from '../core/auth/getPermissionToStore';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { getStore } from '../core/getStore';
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

  const permission = await getPermissionToStore(storeId, userId);

  if (!permission) {
    return FAILED_TO_LOAD_STORE();
  }

  const [store] = await getStore(storeId);

  return STORE({
    store: mapStore(store, permission),
  });
};
