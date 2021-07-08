import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { mapStore } from '../core/models/Store';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const STORES = createSuccessResponse(
  'STORES_RETRIEVED',
  'Retrieved list of stores.',
);

const FAILED_TO_LOAD_STORES = createErrorResponse(
  'STORES_FAILED_TO_LOAD_STORES',
  'An unknown error occurred while attempting to retrieve list of stores. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const userId = await getUserIdFromRequest(req);

  try {
    const { stores } = await getDatabase();

    // TODO replace with a list of store IDs in the user's item, and batch load the store items using fixed sized partition keys
    const { resources: storeResources } = await stores.items.query({
      query: `SELECT * FROM c WHERE ARRAY_CONTAINS(c.userIds, @userId)`,
      parameters: [{ name: '@userId', value: userId }],
    }).fetchAll();

    return STORES({
      stores: storeResources.map((storeResource) => mapStore(storeResource, 'admin')),
    });
  } catch (err) {
    console.error(err);

    return FAILED_TO_LOAD_STORES();
  }
};
