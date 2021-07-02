import { createErrorResponse, createSuccessResponse } from './createResponse';

export const USER_CREATED = createSuccessResponse(
  'USER_CREATED',
  'Successfully created user.',
);

export const MISSING_EMAIL_ADDRESS = createErrorResponse(
  'USERS_ERROR_MISSING_EMAIL_ADDRESS',
  'Missing email address. Please provide an email address and try again.',
  400,
);

export const INVALID_EMAIL_ADDRESS = createErrorResponse(
  'USERS_ERROR_INVALID_EMAIL_ADDRESS',
  'Invalid email address. Please verify your email address and try again.',
  400,
);

export const MISSING_PASSWORD = createErrorResponse(
  'USERS_ERROR_MISSING_PASSWORD',
  'Missing password. Please provide a password and try again.',
  400,
);

export const PASSWORD_TOO_SHORT = createErrorResponse(
  'USERS_ERROR_PASSWORD_TOO_SHORT',
  'Password too short. Please increase the complexity of your password and try again.',
  400,
);

export const USER_ALREADY_EXISTS = createErrorResponse(
  'USERS_ERROR_USER_ALREADY_EXISTS',
  'Sorry, but an user with this email address already exists.',
  400,
);

export const FAILED_TO_CREATE_USER = createErrorResponse(
  'USERS_ERROR_FAILED_TO_CREATE_USER',
  'An unknown error occurred while attempting to create your user. Please try again.',
  500,
);
