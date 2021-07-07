export interface Product {
  name: string;
  description: string;
  price: number;
  images: string[];
  barcode: ProductBarcode | null;
}

export interface ProductBarcode {
  code: string;
  format: 'code_128' | 'ean' | 'ean_8' | 'code_39' | 'code_39_vin' | 'codabar' | 'upc' | 'upc_e' | 'i2of5' | '2of5' | 'code_93';
}
