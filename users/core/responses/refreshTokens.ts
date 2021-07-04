import { createErrorResponse, createSuccessResponse } from './createResponse';

export const TOKENS_REFRESHED = createSuccessResponse(
  'TOKENS_REFRESHED',
  'Successfully refreshed tokens.',
);

export const MISSING_AUTHORIZATION = createErrorResponse(
  'USER_ERROR_MISSING_AUTHORIZATION',
  'Authorization header missing.',
  400,
);

export const INVALID_AUTHORIZATION = createErrorResponse(
  'USER_ERROR_INVALID_AUTHORIZATION',
  'Authorization invalid. Your refresh token may have expired.',
  400,
);
