import { Context, HttpRequest } from '@azure/functions';
import * as bcrypt from 'bcryptjs';
import { getDatabase } from '../core/getDatabase';
import { User } from '../core/models/User';
import * as responses from '../core/responses/createUser';
import { withoutResource } from '../core/models/withoutResource';

interface CreateUser {
  email: string;
  password: string;
}

export default async function (context: Context, req: HttpRequest) {
  const body: CreateUser = req.body;

  if (typeof body.email !== 'string') {
    return responses.MISSING_EMAIL_ADDRESS();
  }
  if (!body.email.includes('@')) {
    return responses.INVALID_EMAIL_ADDRESS();
  }
  if (typeof body.password !== 'string') {
    return responses.MISSING_PASSWORD();
  }
  if (body.password.length < 8) {
    return responses.PASSWORD_TOO_SHORT();
  }

  const { users } = await getDatabase();

  try {
    const { resource: user } = await users.items.create<User>({
      email: body.email.toLowerCase(),
      password: await bcrypt.hash(body.password, 12),
    });

    return responses.USER_CREATED({
      user: withoutResource(user),
    });
  } catch (err) {
    console.error(err);

    switch (err.code) {
      case 409: {
        return responses.USER_ALREADY_EXISTS();
      }
      default: {
        return responses.FAILED_TO_CREATE_USER();
      }
    }
  }
};
