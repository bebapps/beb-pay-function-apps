import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { StoreProduct } from '../core/models/StoreProduct';
import { withoutResource } from '../core/models/withoutResource';
import * as responses from '../core/responses/createProduct';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';

export default async function (context: Context, req: HttpRequest) {
  const userId = await getUserIdFromRequest(req);
  const storeId = req.params.storeId;
  const body = req.body;

  const [belongsToStore] = await doesUserBelongToStore(userId, storeId);

  if (!belongsToStore) {
    return responses.FAILED_TO_CREATE_PRODUCT();
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

    return responses.PRODUCT_CREATED({
      product: withoutResource(productResource),
    });
  } catch (err) {
    console.error(err);

    return responses.FAILED_TO_CREATE_PRODUCT();
  }
};
