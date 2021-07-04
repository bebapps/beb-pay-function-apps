import { Context, HttpRequest } from '@azure/functions';
import { getDatabase } from '../core/getDatabase';
import { User } from '../core/models/User';
import * as bcrypt from 'bcryptjs';
import * as responses from '../core/responses/login';
import { withoutResource } from '../core/models/withoutResource';
import { Resource } from '@azure/cosmos';
import { createRefreshToken } from '../core/auth/createRefreshToken';
import { createAccessToken } from '../core/auth/createAccessToken';

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
    return responses.INVALID_LOGIN();
  }

  const { users } = await getDatabase();

  try {
    const { resources: [user] } = await users.items.query<User & Resource>(
      `SELECT * FROM c`,
      { partitionKey: body.email.toLowerCase() },
    ).fetchAll();

    if (!user) {
      return responses.INVALID_LOGIN();
    }

    if (!await bcrypt.compare(body.password, user.password)) {
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
};
