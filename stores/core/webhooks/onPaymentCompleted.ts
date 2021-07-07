import { Resource } from '@azure/cosmos';
import { getDatabase } from '../getDatabase';
import { StoreCart } from '../models/StoreCart';

interface PaymentCompletedData {
  // Unused fields omitted...
  merchant_reference_id: string;
}

export async function onPaymentCompleted(data: PaymentCompletedData) {
  const { storeCarts } = await getDatabase();

  const storeCartId = data.merchant_reference_id;
  const { resources: storeCartResources } = await storeCarts.items.query({
    query: 'SELECT * FROM c WHERE c.id = @id',
    parameters: [
      { name: '@id', value: storeCartId },
    ],
  }).fetchAll();

  if (!storeCartResources.length) {
    throw new Error(`Failed to locate store cart from payment completed webhook (merchant_reference_id: ${data.merchant_reference_id}).`);
  }

  const [storeCartResource] = storeCartResources as (StoreCart & Resource)[];
  storeCartResource.status = 'paid';

  await storeCarts.item(storeCartResource.id, storeCartResource.storeId).replace(storeCartResource, {
    accessCondition: {
      condition: storeCartResource._etag,
      type: 'IfMatch',
    },
  });

  // TODO push out store webhooks too
}
