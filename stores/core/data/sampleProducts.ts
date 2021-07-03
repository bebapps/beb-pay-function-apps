import { Product } from '../models/Product';

export const sampleProducts: Product[] = [
  {
    name: 'Arnotts Shapes Crackers Chicken Crimpy',
    description: 'Made in Australia',
    price: 3.30,
    images: [
      { resourcePath: '/sample-product-images/chicken-shapes-0.webp' },
      { resourcePath: '/sample-product-images/chicken-shapes-1.jpeg' },
      { resourcePath: '/sample-product-images/chicken-shapes-2.webp' },
    ],
  },
  {
    name: 'Arnotts Shapes Crackers Cheddar',
    description: 'Made in Australia',
    price: 3.30,
    images: [
      { resourcePath: '/sample-product-images/cheddar-shapes-0.jpeg' },
      { resourcePath: '/sample-product-images/cheddar-shapes-1.jpeg' },
      { resourcePath: '/sample-product-images/cheddar-shapes-2.jpeg' },
    ],
  },
];
