import { Context, HttpRequest } from '@azure/functions';
import * as bcrypt from 'bcryptjs';
import { getDatabase } from '../core/getDatabase';
import { User } from '../core/models/User';
import { withoutResource } from '../core/models/withoutResource';
import { createRefreshToken } from '../core/auth/createRefreshToken';
import { createAccessToken } from '../core/auth/createAccessToken';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const USER_CREATED = createSuccessResponse(
  'USER_CREATED',
  'Successfully created user.',
);

const MISSING_EMAIL_ADDRESS = createErrorResponse(
  'USERS_ERROR_MISSING_EMAIL_ADDRESS',
  'Missing email address. Please provide an email address and try again.',
  400,
);

const INVALID_EMAIL_ADDRESS = createErrorResponse(
  'USERS_ERROR_INVALID_EMAIL_ADDRESS',
  'Invalid email address. Please verify your email address and try again.',
  400,
);

const MISSING_PASSWORD = createErrorResponse(
  'USERS_ERROR_MISSING_PASSWORD',
  'Missing password. Please provide a password and try again.',
  400,
);

const PASSWORD_TOO_SHORT = createErrorResponse(
  'USERS_ERROR_PASSWORD_TOO_SHORT',
  'Password too short. Please increase the complexity of your password and try again.',
  400,
);

const USER_ALREADY_EXISTS = createErrorResponse(
  'USERS_ERROR_USER_ALREADY_EXISTS',
  'Sorry, but an user with this email address already exists.',
  400,
);

const FAILED_TO_CREATE_USER = createErrorResponse(
  'USERS_ERROR_FAILED_TO_CREATE_USER',
  'An unknown error occurred while attempting to create your user. Please try again.',
  500,
);

interface CreateUser {
  email: string;
  password: string;
}

export default async function (context: Context, req: HttpRequest) {
  const body: CreateUser = req.body;

  if (typeof body.email !== 'string') {
    return MISSING_EMAIL_ADDRESS();
  }
  if (!body.email.includes('@')) {
    return INVALID_EMAIL_ADDRESS();
  }
  if (typeof body.password !== 'string') {
    return MISSING_PASSWORD();
  }
  if (body.password.length < 8) {
    return PASSWORD_TOO_SHORT();
  }

  const { users } = await getDatabase();

  try {
    const { resource: user } = await users.items.create<User>({
      email: body.email.toLowerCase(),
      password: await bcrypt.hash(body.password, 12),
    });

    const [refreshToken, accessToken] = await Promise.all([
      createRefreshToken(user.id),
      createAccessToken(user.id),
    ]);

    return USER_CREATED({
      user: withoutResource(user),
      authorization: {
        refreshToken,
        accessToken,
      },
    });
  } catch (err) {
    console.error(err);

    switch (err.code) {
      case 409: {
        return USER_ALREADY_EXISTS();
      }
      default: {
        return FAILED_TO_CREATE_USER();
      }
    }
  }
};
