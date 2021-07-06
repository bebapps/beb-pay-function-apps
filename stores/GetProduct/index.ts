import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';
import { mapStoreProduct, StoreProduct } from '../core/models/StoreProduct';

const PRODUCT = createSuccessResponse(
  'PRODUCT_RETRIEVED',
  'Retrieved product.',
);

const PRODUCT_NOT_FOUND = createErrorResponse(
  'STORES_PRODUCT_NOT_FOUND',
  'Product does not exist.',
  404,
);

const FAILED_TO_LOAD_PRODUCT = createErrorResponse(
  'STORES_FAILED_TO_LOAD_PRODUCT',
  'An unknown error occurred while attempting to retrieve product. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const userId = await getUserIdFromRequest(req);
  const { storeId, productId } = req.params;

  const [belongsToStore] = await doesUserBelongToStore(userId, storeId);

  if (!belongsToStore) {
    return FAILED_TO_LOAD_PRODUCT();
  }

  try {
    const { storeProducts } = await getDatabase();

    const storeProductItem = storeProducts.item(productId, storeId);
    const { statusCode, resource: storeProductResource } = await storeProductItem.read<StoreProduct>();

    if (statusCode === 404) {
      return PRODUCT_NOT_FOUND();
    }

    return PRODUCT({
      product: mapStoreProduct(storeProductResource),
    });
  } catch (err) {
    console.error(err);

    return FAILED_TO_LOAD_PRODUCT();
  }
};
