import { createErrorResponse, createSuccessResponse } from './createResponse';

export const LOGGED_IN = createSuccessResponse(
  'LOGGED_IN',
  'Successfully logged in.',
);

export const INVALID_LOGIN = createErrorResponse(
  'USERS_ERROR_INVALID_LOGIN',
  'Invalid login, please try again.',
  400,
);

export const FAILED_TO_LOGIN = createErrorResponse(
  'USERS_FAILED_TO_LOGIN',
  'An unknown error occurred while attempting to login. Please try again.',
  500,
);
