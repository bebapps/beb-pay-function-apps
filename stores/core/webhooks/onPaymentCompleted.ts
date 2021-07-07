import { getDatabase } from '../getDatabase';
import { StoreCart } from '../models/StoreCart';

interface PaymentCompletedData {
  // Unused fields omitted...
  merchant_reference_id: string;
}

export async function onPaymentCompleted(data: PaymentCompletedData) {
  const { storeCarts } = await getDatabase();

  const storeCartItem = storeCarts.item(data.merchant_reference_id);
  const { statusCode, resource: storeCartResource } = await storeCartItem.read<StoreCart>();

  if (statusCode === 404) {
    throw new Error(`Failed to locate store cart from payment completed webhook (merchant_reference_id: ${data.merchant_reference_id}).`);
  }

  storeCartResource.status = 'paid';

  await storeCartItem.replace(storeCartResource, {
    accessCondition: {
      condition: storeCartResource._etag,
      type: 'IfMatch',
    },
  });

  // TODO push out store webhooks too
}
