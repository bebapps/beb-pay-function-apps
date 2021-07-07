import { Product } from '../models/Product';

export const sampleProducts: Product[] = [
  {
    name: 'Arnotts Shapes Crackers Chicken Crimpy',
    description: 'Made in Australia',
    price: 3.30,
    images: [
      '/sample-product-images/chicken-shapes-0.webp',
      '/sample-product-images/chicken-shapes-1.jpeg',
      '/sample-product-images/chicken-shapes-2.webp',
    ],
    barcode: null,
  },
  {
    name: 'Arnotts Shapes Crackers Cheddar',
    description: 'Made in Australia',
    price: 3.30,
    images: [
      '/sample-product-images/cheddar-shapes-0.jpeg',
      '/sample-product-images/cheddar-shapes-1.jpeg',
      '/sample-product-images/cheddar-shapes-2.jpeg',
    ],
    barcode: null,
  },
  {
    name: 'Clearwipe Lens Cleaner',
    description: 'Quick Drying Pre-moistened Wipes',
    price: 7.99,
    images: [
      '/sample-product-images/clearwipe-lens-cleaner.webp',
    ],
    barcode: {
      format: 'upc_e',
      code: '12181292',
    },
  },
];
