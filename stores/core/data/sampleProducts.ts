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
      format: 'ean_13',
      code: '4987072080993',
    },
  },
  {
    name: 'Harry Potter: Spells and Charms Ruled Journal',
    description: 'A truly magical Harry Potter ruled journal.',
    price: 11.50,
    images: [
      '/sample-product-images/harry-potter-spells-and-charms-ruled-journal.jpeg',
    ],
    barcode: {
      format: 'ean_13',
      code: '9401063002443',
    },
  },
  {
    name: 'Einstein Collection Metal Puzzles',
    description: `Formed of the symbols of Einstein's ground-breaking E=mc2 equation, see if you can separate the two pieces of each metal puzzle and then reattach them Developed in 1905, Einstein's famous theory...`,
    price: 19.99,
    images: [
      '/sample-product-images/einstein-collection-metal-puzzles.jpeg',
    ],
    barcode: {
      format: 'ean_13',
      code: '5060506531397',
    },
  },
];
