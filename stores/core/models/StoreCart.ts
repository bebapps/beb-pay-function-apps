import { Resource } from '@azure/cosmos';
import { getPublicUrl } from '../getPublicUrl';

export interface StoreCart {
  storeId: string;
  status: 'unpaid' | 'paid';
  total: number;
  items: StoreCartProductItem[];
  checkoutPage: StoreCartCheckoutPage;
}

export interface StoreCartCheckoutPage {
  id: `checkout_${string}`;
  url: string;
}

export interface StoreCartProductItem {
  type: 'product';
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export function mapStoreCart(storeCart: StoreCart & Resource) {
  return {
    id: storeCart.id,
    status: storeCart.status,
    total: storeCart.total,
    items: storeCart.items.map((item) => ({
      ...item,
      image: item.image && getPublicUrl(item.image),
    })),
    checkoutUrl: storeCart.checkoutPage.url,
  };
}
