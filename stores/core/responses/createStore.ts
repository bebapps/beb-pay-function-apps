import { createErrorResponse, createSuccessResponse } from './createResponse';

export const STORE_CREATED = createSuccessResponse(
  'STORE_CREATED',
  'Successfully created store.',
);

export const FAILED_TO_CREATE_STORE = createErrorResponse(
  'STORES_FAILED_TO_CREATE_STORE',
  'An unknown error occurred while attempting to create the store. Please try again.',
  500,
);
