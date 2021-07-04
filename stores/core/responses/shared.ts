import { createErrorResponse } from './createResponse';

export const NO_PERMISSION = createErrorResponse(
  'NO_PERMISSION',
  'You do not have permission to perform this action.',
  403,
);

export const NOT_FOUND = createErrorResponse(
  'NOT_FOUND',
  'This resource was not found. Please try again.',
  404,
);
