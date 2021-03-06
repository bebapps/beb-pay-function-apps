import { v4 as uuid } from 'uuid';
import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { mapStoreProduct, StoreProduct } from '../core/models/StoreProduct';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';
import { Resource } from '@azure/cosmos';
import { importProductImage } from '../core/resources/importProductImage';

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

  const productId = uuid();
  const images: string[] = [];

  if (body.imageUrls) {
    const importedImageResourcePaths = await Promise.all(body.imageUrls.map((imageUrl) => importProductImage(productId, imageUrl)));
    images.push(...importedImageResourcePaths.filter(Boolean) as string[]);
  }

  const product: StoreProduct & Pick<Resource, 'id'> = {
    id: productId,
    storeId,
    name: body.name,
    description: body.description,
    price: body.price,
    images,
    barcode: body.barcode ?? null,
  };

  try {
    const { storeProducts } = await getDatabase();
    const { resource: productResource } = await storeProducts.items.create(product);

    return PRODUCT_CREATED({
      product: mapStoreProduct(productResource),
    });
  } catch (err) {
    console.error(err);

    return FAILED_TO_CREATE_PRODUCT();
  }
};
