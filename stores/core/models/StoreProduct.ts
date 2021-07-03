import { Product } from './Product';

export interface StoreProduct extends Product {
  storeId: string;
}
