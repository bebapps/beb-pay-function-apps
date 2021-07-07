import { v4 as uuid } from 'uuid';
import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { sampleProducts } from '../core/data/sampleProducts';
import { getDatabase } from '../core/getDatabase';
import { mapStore, Store } from '../core/models/Store';
import { getRapydClient } from '../core/rapyd/client';
import { createWallet } from '@bebapps/rapyd-sdk/dist/generated/wallet/apis/Wallet';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';
import { Resource } from '@azure/cosmos';

const STORE_CREATED = createSuccessResponse(
  'STORE_CREATED',
  'Successfully created store.',
);

const FAILED_TO_CREATE_STORE = createErrorResponse(
  'STORES_FAILED_TO_CREATE_STORE',
  'An unknown error occurred while attempting to create the store. Please try again.',
  500,
);

type CreateStore = Partial<Pick<Store, 'name' | 'description' | 'country' | 'currency' | 'branding'>>;

export default async function (context: Context, req: HttpRequest) {
  const userId = await getUserIdFromRequest(req);
  const { stores, storeProducts } = await getDatabase();
  const body = req.body as CreateStore;

  const store: Store & Pick<Resource, 'id'> = {
    id: uuid(),
    status: 'inactive',
    name: body.name ?? 'My Store',
    description: body.description ?? null,
    country: body.country ?? null,
    currency: body.currency ?? null,
    userIds: [userId],
    logo: null,
    branding: { ...body.branding },
    wallet: null,
    createdDate: new Date().toISOString(),
    createdBy: userId,
    lastUpdatedDate: null,
    lastUpdatedBy: null,
  };

  try {
    const wallet = await createWallet(await getRapydClient(), {
      contact: {
        contact_type: 'personal',
      },
      ewallet_reference_id: store.id,
    });
    store.wallet = {
      id: wallet.id,
    };

    const { resource: storeResource } = await stores.items.create<Store>(store);

    await storeProducts.items.bulk(sampleProducts.map((product) => ({
      operationType: 'Create',
      resourceBody: {
        storeId: storeResource.id,
        ...product,
      } as any,
    })));

    return STORE_CREATED({
      store: mapStore(storeResource),
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
