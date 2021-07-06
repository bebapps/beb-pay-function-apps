import { Context, HttpRequest } from '@azure/functions';
import { getDatabase } from '../core/getDatabase';
import { User } from '../core/models/User';
import * as bcrypt from 'bcryptjs';
import { withoutResource } from '../core/models/withoutResource';
import { Resource } from '@azure/cosmos';
import { createRefreshToken } from '../core/auth/createRefreshToken';
import { createAccessToken } from '../core/auth/createAccessToken';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const LOGGED_IN = createSuccessResponse(
  'LOGGED_IN',
  'Successfully logged in.',
);

const INVALID_LOGIN = createErrorResponse(
  'USERS_ERROR_INVALID_LOGIN',
  'Invalid login, please try again.',
  400,
);

const FAILED_TO_LOGIN = createErrorResponse(
  'USERS_FAILED_TO_LOGIN',
  'An unknown error occurred while attempting to login. Please try again.',
  500,
);

interface Login {
  email: string;
  password: string;
}

export default async function (context: Context, req: HttpRequest) {
  const body = req.body as Login;

  if (
    typeof body.email !== 'string' ||
    !body.email.includes('@') ||
    typeof body.password !== 'string'
  ) {
    return INVALID_LOGIN();
  }

  const { users } = await getDatabase();

  try {
    const { resources: [user] } = await users.items.query<User & Resource>(
      `SELECT * FROM c`,
      { partitionKey: body.email.toLowerCase() },
    ).fetchAll();

    if (!user) {
      return INVALID_LOGIN();
    }

    if (!await bcrypt.compare(body.password, user.password)) {
      return INVALID_LOGIN();
    }

    const [refreshToken, accessToken] = await Promise.all([
      createRefreshToken(user.id),
      createAccessToken(user.id),
    ]);

    return LOGGED_IN({
      user: withoutResource(user),
      authorization: {
        refreshToken,
        accessToken,
      },
    });
  } catch (err) {
    console.error(err);

    switch (err.code) {
      default: {
        return FAILED_TO_LOGIN();
      }
    }
  }
};
