import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { withoutResource } from '../core/models/withoutResource';
import { getUrlFromResourcePath } from '../core/resources/getUrlFromResourcePath';
import * as responses from '../core/responses/getProducts';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';

export default async function (context: Context, req: HttpRequest) {
  const userId = await getUserIdFromRequest(req);
  const storeId = req.params.storeId;

  const [belongsToStore] = await doesUserBelongToStore(userId, storeId);

  if (!belongsToStore) {
    return responses.FAILED_TO_LOAD_PRODUCTS();
  }

  try {
    const { storeProducts } = await getDatabase();
    const { resources: storeProductResources } = await storeProducts.items.readAll({ partitionKey: storeId }).fetchAll();

    return responses.PRODUCTS({
      products: await Promise.all(storeProductResources.map(async (resource) => ({
        ...withoutResource(resource),
        images: await Promise.all(resource.images.map((image) => getUrlFromResourcePath(image.resourcePath))),
      }))),
    });
  } catch (err) {
    console.error(err);

    return responses.FAILED_TO_LOAD_PRODUCTS();
  }
};
