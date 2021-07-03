import { createErrorResponse, createSuccessResponse } from './createResponse';

export const PRODUCT_CREATED = createSuccessResponse(
  'PRODUCT_CREATED',
  'Successfully created product.',
);

export const FAILED_TO_CREATE_PRODUCT = createErrorResponse(
  'STORES_FAILED_TO_CREATE_PRODUCT',
  'An unknown error occurred while attempting to create a product. Please try again.',
  500,
);
