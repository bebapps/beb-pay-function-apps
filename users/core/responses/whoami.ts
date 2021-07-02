import { createErrorResponse, createSuccessResponse } from './createResponse';

export const AUTHORIZED = createSuccessResponse(
  'AUTHORIZED',
  'Successfully authorized.',
);

export const MISSING_AUTHORIZATION = createErrorResponse(
  'USER_ERROR_MISSING_AUTHORIZATION',
  'Authorization header missing.',
  400,
);

export const INVALID_AUTHORIZATION = createErrorResponse(
  'USER_ERROR_INVALID_AUTHORIZATION',
  'Authorization invalid. Your access token may have expired.',
  400,
);
