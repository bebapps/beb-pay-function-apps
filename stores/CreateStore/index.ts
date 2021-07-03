import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { sampleProducts } from '../core/data/sampleProducts';
import { getDatabase } from '../core/getDatabase';
import { Store } from '../core/models/Store';
import { withoutResource } from '../core/models/withoutResource';
import * as responses from '../core/responses/createStore';

export default async function (context: Context, req: HttpRequest) {
  const userId = await getUserIdFromRequest(req);
  const { stores, storeProducts } = await getDatabase();
  const body = req.body;

  const store: Store = {
    name: body.name,
    userIds: [userId],
    createdDate: new Date().toISOString(),
    createdByUserId: userId,
  };

  try {
    const { resource: storeResource } = await stores.items.create<Store>(store);

    await storeProducts.items.bulk(sampleProducts.map((product) => ({
      operationType: 'Create',
      resourceBody: {
        storeId: storeResource.id,
        ...product,
      },
    })));

    return responses.STORE_CREATED({
      store: withoutResource(storeResource),
    });
  } catch (err) {
    console.error(err);

    switch (err.code) {
      default: {
        return responses.FAILED_TO_CREATE_STORE();
      }
    }
  }
};
