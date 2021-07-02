import { getDatabase } from '../getDatabase';
import { User } from '../models/User';
import * as bcrypt from 'bcryptjs';
import * as responses from '../responses/createUser';
import { withoutResource } from '../models/withoutResource';

export interface CreateUser {
  email: string;
  password: string;
}

export async function createUser(options: CreateUser) {
  if (typeof options.email !== 'string') {
    return responses.MISSING_EMAIL_ADDRESS();
  }
  if (!options.email.includes('@')) {
    return responses.INVALID_EMAIL_ADDRESS();
  }
  if (typeof options.password !== 'string') {
    return responses.MISSING_PASSWORD();
  }
  if (options.password.length < 8) {
    return responses.PASSWORD_TOO_SHORT();
  }

  const { users } = await getDatabase();

  try {
    const { resource: user } = await users.items.create<User>({
      email: options.email.toLowerCase(),
      password: await bcrypt.hash(options.password, 12),
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
}
