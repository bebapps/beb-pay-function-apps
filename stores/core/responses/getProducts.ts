import { createErrorResponse, createSuccessResponse } from './createResponse';

export const PRODUCTS = createSuccessResponse(
  'PRODUCTS_RETRIEVED',
  'Retrieved list of products.',
);

export const FAILED_TO_LOAD_PRODUCTS = createErrorResponse(
  'STORES_FAILED_TO_LOAD_PRODUCTS',
  'An unknown error occurred while attempting to retrieve list of products. Please try again.',
  500,
);
