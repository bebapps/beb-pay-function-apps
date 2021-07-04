import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { withoutResource } from '../core/models/withoutResource';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const PRODUCTS = createSuccessResponse(
  'PRODUCTS_RETRIEVED',
  'Retrieved list of products.',
);

const FAILED_TO_LOAD_PRODUCTS = createErrorResponse(
  'STORES_FAILED_TO_LOAD_PRODUCTS',
  'An unknown error occurred while attempting to retrieve list of products. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const userId = await getUserIdFromRequest(req);
  const storeId = req.params.storeId;

  const [belongsToStore] = await doesUserBelongToStore(userId, storeId);

  if (!belongsToStore) {
    return FAILED_TO_LOAD_PRODUCTS();
  }

  try {
    const { storeProducts } = await getDatabase();
    const { resources: storeProductResources } = await storeProducts.items.readAll({ partitionKey: storeId }).fetchAll();

    return PRODUCTS({
      products: storeProductResources.map((storeProductResource) => withoutResource(storeProductResource)),
    });
  } catch (err) {
    console.error(err);

    return FAILED_TO_LOAD_PRODUCTS();
  }
};
