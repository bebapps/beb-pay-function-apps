import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { updateStoreAsUser } from '../core/updateStoreAsUser';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const USER_ADDED_TO_STORE = createSuccessResponse(
  'USER_ADDED_TO_STORE',
  'Successfully added user to store.',
);

const FAILED_TO_ADD_USER_TO_STORE = createErrorResponse(
  'STORES_FAILED_TO_ADD_USER_TO_STORE',
  'An unknown error occurred while attempting to remove user from store. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const { storeId } = req.params;
  const { userId: newUserId } = req.body;
  const userId = await getUserIdFromRequest(req);

  return await updateStoreAsUser(storeId, userId, async (store) => {
    store.userIds = [
      ...new Set([
        ...store.userIds,
        newUserId,
      ]),
    ];

    return {
      store,
    };
  }, {
    success: USER_ADDED_TO_STORE,
    failure: FAILED_TO_ADD_USER_TO_STORE,
  });
};
