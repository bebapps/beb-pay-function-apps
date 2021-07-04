import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { updateStoreAsUser } from '../core/updateStoreAsUser';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const USER_REMOVED_FROM_STORE = createSuccessResponse(
  'USER_REMOVED_FROM_STORE',
  'Successfully removed user from store.',
);

const FAILED_TO_REMOVE_USER_FROM_STORE = createErrorResponse(
  'STORES_FAILED_TO_REMOVE_USER_FROM_STORE',
  'An unknown error occurred while attempting to remove user from store. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const { storeId } = req.params;
  const { userId: removeUserId } = req.body;

  const userId = await getUserIdFromRequest(req);

  return await updateStoreAsUser(storeId, userId, async (store) => {
    if (!store.userIds.includes(removeUserId)) {
      return false;
    }

    store.userIds.splice(removeUserId);

    return {
      store,
    };
  }, {
    success: USER_REMOVED_FROM_STORE,
    failure: FAILED_TO_REMOVE_USER_FROM_STORE,
  });
};
