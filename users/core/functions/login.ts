import { getDatabase } from '../getDatabase';
import { User } from '../models/User';
import * as bcrypt from 'bcryptjs';
import * as responses from '../responses/login';
import { withoutResource } from '../models/withoutResource';
import { Resource } from '@azure/cosmos';
import { createRefreshToken } from '../auth/createRefreshToken';
import { createAccessToken } from '../auth/createAccessToken';

export interface Login {
  email: string;
  password: string;
}

export async function login(options: Login) {
  if (
    typeof options.email !== 'string' ||
    !options.email.includes('@') ||
    typeof options.password !== 'string'
  ) {
    return responses.INVALID_LOGIN();
  }

  const { users } = await getDatabase();

  try {
    const { resources: [user] } = await users.items.query<User & Resource>(
      `SELECT * FROM c`,
      { partitionKey: options.email },
    ).fetchAll();

    if (!user) {
      return responses.INVALID_LOGIN();
    }

    if (!await bcrypt.compare(options.password, user.password)) {
      return responses.INVALID_LOGIN();
    }

    const [refreshToken, accessToken] = await Promise.all([
      createRefreshToken(user.id),
      createAccessToken(user.id),
    ]);

    return responses.LOGGED_IN({
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
        return responses.FAILED_TO_LOGIN();
      }
    }
  }
}
