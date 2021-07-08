import { Resource } from '@azure/cosmos';
import { getDatabase } from '../getDatabase';
import { StoreCart } from '../models/StoreCart';
import { retrieveWallet } from '@bebapps/rapyd-sdk/dist/generated/wallet/apis/Wallet';
import { getRapydClient } from '../rapyd/client';
import { getStore } from '../getStore';

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

  const [store, storeItem] = await getStore(storeCartResource.storeId);

  const rapidClient = await getRapydClient();
  const wallet = await retrieveWallet(rapidClient, { wallet: store.wallet.id });

  store.wallet.balances = wallet.accounts.reduce((balances, account) => ({
    ...balances,
    [account.currency as string]: account.balance,
  }), {});

  await storeItem.replace(store);

  // TODO push out store webhooks too
}
