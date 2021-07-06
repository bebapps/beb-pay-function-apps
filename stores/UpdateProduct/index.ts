import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { mapStoreProduct, StoreProduct } from '../core/models/StoreProduct';
import { withoutResource } from '../core/models/withoutResource';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';
import { uploadProductImage } from '../core/resources/uploadProductImage';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';
import { getBody } from '../core/getBody';
import { Product } from '../core/models/Product';

const PRODUCT_IMAGE_ADDED = createSuccessResponse(
  'PRODUCT_IMAGE_ADDED',
  'Successfully added image to product.',
);

const FAILED_TO_ADD_PRODUCT_IMAGE = createErrorResponse(
  'STORES_FAILED_TO_ADD_PRODUCT_IMAGE',
  'An unknown error occurred while attempting to add image to product. Please try again.',
  500,
);

type UpdateProduct = Partial<Pick<Product, 'name' | 'description' | 'price'>>;

export default async function (context: Context, req: HttpRequest) {
  const [fields, files] = getBody<UpdateProduct>(req);
  const userId = await getUserIdFromRequest(req);
  const { storeId, productId } = req.params;

  const [belongsToStore] = await doesUserBelongToStore(userId, storeId);

  if (!belongsToStore) {
    return FAILED_TO_ADD_PRODUCT_IMAGE();
  }

  try {
    const { storeProducts } = await getDatabase();
    const storeProductItem = storeProducts.item(productId, storeId);

    const { resource: storeProductResource } = await storeProductItem.read<StoreProduct>();

    if (typeof fields.name !== 'undefined') {
      storeProductResource.name = fields.name;
    }

    if (typeof fields.description !== 'undefined') {
      storeProductResource.description = fields.description;
    }

    if (typeof fields.price !== 'undefined') {
      storeProductResource.price = fields.price;
    }

    if (Array.isArray(files.images)) {
      storeProductResource.images.push(...await Promise.all(files.images.map((image) => (
        uploadProductImage(productId, image.value, image.contentType)
      ))));
    }

    await storeProductItem.replace(storeProductResource);

    return PRODUCT_IMAGE_ADDED({
      product: mapStoreProduct(storeProductResource),
    });
  } catch (err) {
    console.error(err);

    return FAILED_TO_ADD_PRODUCT_IMAGE();
  }
};
