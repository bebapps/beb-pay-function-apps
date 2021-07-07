import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { createSuccessResponse } from '../core/responses/createResponse';
import { NOT_FOUND, NO_PERMISSION } from '../core/responses/shared';
import { getPermissionToStore } from '../core/auth/getPermissionToStore';
import { getStoreProduct } from '../core/getStoreProduct';
import { deleteResource } from '../core/resources/deleteResource';

const PRODUCT_DELETED = createSuccessResponse(
  'PRODUCT_DELETED',
  'Successfully deleted product.',
);

export default async function (context: Context, req: HttpRequest) {
  const { storeId, productId } = req.params;
  const userId = await getUserIdFromRequest(req);
  const permission = await getPermissionToStore(storeId, userId);

  if (permission !== 'admin') {
    return NO_PERMISSION();
  }

  const [storeProduct, storeProductItem] = await getStoreProduct(storeId, productId);

  if (!storeProduct) {
    return NOT_FOUND();
  }

  await Promise.all(storeProduct.images.map((resourcePath) => deleteResource(resourcePath)));
  await storeProductItem.delete();

  return PRODUCT_DELETED();
};
