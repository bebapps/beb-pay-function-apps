import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { StoreProduct } from '../core/models/StoreProduct';
import { withoutResource } from '../core/models/withoutResource';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';
import { FormDataItem, getMultipartFormData } from '../core/getMultipartFormData';
import { uploadProductImage } from '../core/resources/uploadProductImage';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const PRODUCT_IMAGE_ADDED = createSuccessResponse(
  'PRODUCT_IMAGE_ADDED',
  'Successfully added image to product.',
);

const FAILED_TO_ADD_PRODUCT_IMAGE = createErrorResponse(
  'STORES_FAILED_TO_ADD_PRODUCT_IMAGE',
  'An unknown error occurred while attempting to add image to product. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const formData = getMultipartFormData(req);
  const userId = await getUserIdFromRequest(req);
  const { storeId, productId } = req.params;

  const [belongsToStore] = await doesUserBelongToStore(userId, storeId);

  if (!belongsToStore) {
    return FAILED_TO_ADD_PRODUCT_IMAGE();
  }

  const images: FormDataItem[] = [];
  for (const [, file] of formData) {
    images.push(file);
  }

  try {
    const resourcePaths = await Promise.all(images.map((image) => (
      uploadProductImage(productId, image.value, image.contentType)
    )));

    const { storeProducts } = await getDatabase();
    const storeProductItem = storeProducts.item(productId, storeId);

    const { resource: productResource } = await storeProductItem.read<StoreProduct>();
    productResource.images.push(...resourcePaths);
    await storeProductItem.replace(productResource);

    return PRODUCT_IMAGE_ADDED({
      product: withoutResource(productResource),
    });
  } catch (err) {
    console.error(err);

    return FAILED_TO_ADD_PRODUCT_IMAGE();
  }
};
