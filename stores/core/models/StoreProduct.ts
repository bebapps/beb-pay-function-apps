import { Resource } from '@azure/cosmos';
import { Product } from './Product';

export interface StoreProduct extends Product {
  storeId: string;
}

export function mapStoreProduct(storeProduct: StoreProduct & Resource) {
  return {
    id: storeProduct.id,
    name: storeProduct.name,
    description: storeProduct.description,
    price: storeProduct.price,
    images: storeProduct.images,
  };
}
