import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { sampleProducts } from '../core/data/sampleProducts';
import { getDatabase } from '../core/getDatabase';
import { Store } from '../core/models/Store';
import { withoutResource } from '../core/models/withoutResource';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const STORE_CREATED = createSuccessResponse(
  'STORE_CREATED',
  'Successfully created store.',
);

const FAILED_TO_CREATE_STORE = createErrorResponse(
  'STORES_FAILED_TO_CREATE_STORE',
  'An unknown error occurred while attempting to create the store. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const userId = await getUserIdFromRequest(req);
  const { stores, storeProducts } = await getDatabase();
  const body = req.body;

  const store: Store = {
    name: body.name,
    userIds: [userId],
    logo: null,
    branding: {},
    createdDate: new Date().toISOString(),
    createdBy: userId,
    lastUpdatedDate: null,
    lastUpdatedBy: null,
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

    return STORE_CREATED({
      store: withoutResource(storeResource),
    });
  } catch (err) {
    console.error(err);

    switch (err.code) {
      default: {
        return FAILED_TO_CREATE_STORE();
      }
    }
  }
};
