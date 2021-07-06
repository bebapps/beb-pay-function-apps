import { Context, HttpRequest } from '@azure/functions';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { mapStore } from '../core/models/Store';
import { withoutResource } from '../core/models/withoutResource';
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
  const userId = await getUserIdFromRequest(req);
  const { storeId } = req.params;

  const [doesBelong, store] = await doesUserBelongToStore(userId, storeId);

  if (doesBelong || store.status === 'active') {
    return STORE({
      store: mapStore(store),
    });
  }

  return FAILED_TO_LOAD_STORE();
};
