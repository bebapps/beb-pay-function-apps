import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { StoreProduct } from '../core/models/StoreProduct';
import { withoutResource } from '../core/models/withoutResource';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const PRODUCT_CREATED = createSuccessResponse(
  'PRODUCT_CREATED',
  'Successfully created product.',
);

const FAILED_TO_CREATE_PRODUCT = createErrorResponse(
  'STORES_FAILED_TO_CREATE_PRODUCT',
  'An unknown error occurred while attempting to create a product. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const userId = await getUserIdFromRequest(req);
  const storeId = req.params.storeId;
  const body = req.body;

  const [belongsToStore] = await doesUserBelongToStore(userId, storeId);

  if (!belongsToStore) {
    return FAILED_TO_CREATE_PRODUCT();
  }

  const product: StoreProduct = {
    storeId,
    name: body.name,
    description: body.description,
    price: body.price,
    images: [],
  };

  try {
    const { storeProducts } = await getDatabase();
    const { resource: productResource } = await storeProducts.items.create(product);

    return PRODUCT_CREATED({
      product: withoutResource(productResource),
    });
  } catch (err) {
    console.error(err);

    return FAILED_TO_CREATE_PRODUCT();
  }
};
