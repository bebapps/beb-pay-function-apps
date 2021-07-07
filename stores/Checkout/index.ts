import { v4 as uuid } from 'uuid';
import { Context, HttpRequest } from '@azure/functions';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';
import { getDatabase } from '../core/getDatabase';
import { StoreProduct } from '../core/models/StoreProduct';
import { Resource } from '@azure/cosmos';
import { Store } from '../core/models/Store';
import { getRapydClient } from '../core/rapyd/client';
import { createCheckoutPage } from '@bebapps/rapyd-sdk/dist/generated/collect/apis/CheckoutPage';
import { getPublicUrl } from '../core/getPublicUrl';
import { mapStoreCart, StoreCart, StoreCartProductItem } from '../core/models/StoreCart';

const CART_CREATED = createSuccessResponse(
  'CART_CREATED',
  'Successfully created cart.',
);

const PRODUCT_DOES_NOT_EXIST = createErrorResponse(
  'STORES_PRODUCT_DOES_NOT_EXIST',
  'One or more of the products specified do not exist. The product(s) may have been removed since it was added to your cart.',
  400,
);

const FAILED_TO_CREATE_CART = createErrorResponse(
  'STORES_FAILED_TO_CREATE_CART',
  'An unknown error occurred while attempting to create your cart. Please try again.',
  500,
);

interface CreateCheckout {
  items: {
    productId: string;
    quantity?: number;
  }[];
}

export default async function (context: Context, req: HttpRequest) {
  const { storeId } = req.params;
  const body = req.body as CreateCheckout;

  const { stores, storeProducts, storeCarts } = await getDatabase();

  const responses = await storeProducts.items.bulk(body.items.map((item) => ({
    operationType: 'Read',
    id: item.productId,
    partitionKey: storeId,
  })));

  const cartItems: { name: string; quantity: number; amount: number; image: string; }[] = [];
  const items: StoreCartProductItem[] = [];

  let productIndex = 0;
  for (const response of responses) {
    if (response.statusCode === 404) {
      return PRODUCT_DOES_NOT_EXIST();
    }

    const productResource = response.resourceBody as unknown as StoreProduct & Resource;
    cartItems.push({
      name: productResource.name,
      amount: productResource.price,
      quantity: body.items[productIndex].quantity ?? 1,
      image: getPublicUrl(productResource.images[0]),
    });
    items.push({
      type: 'product',
      id: body.items[productIndex].productId,
      name: productResource.name,
      price: productResource.price,
      quantity: body.items[productIndex].quantity ?? 1,
      image: productResource.images[0],
    });

    productIndex++;
  }

  const storeCartId = uuid();

  const { resource: storeResource } = await stores.item(storeId, storeId).read<Store>();
  const { country, currency, wallet } = storeResource;

  const rapidClient = await getRapydClient();
  const checkoutPage = await createCheckoutPage(rapidClient, {
    country,
    currency,
    ewallet: wallet.id,
    cart_items: cartItems,
    description: 'Example',
    merchant_reference_id: storeCartId,
  });

  const storeCart: StoreCart & Pick<Resource, 'id'> = {
    id: storeCartId,
    storeId,
    status: 'unpaid',
    total: checkoutPage.amount,
    items,
    checkoutPage: {
      id: checkoutPage.id,
      url: checkoutPage.redirect_url,
    },
  };

  const { resource: storeCartResource } = await storeCarts.items.create(storeCart);

  return CART_CREATED({
    cart: mapStoreCart(storeCartResource),
  });
};
