import { verifyJwt } from '../auth/verifyJwt';
import { getDatabase } from '../getDatabase';
import { withoutResource } from '../models/withoutResource';
import * as responses from '../responses/whoami';

export async function whoami(authorization: string) {
  const [, token] = authorization.split(' ');

  if (!token) {
    return responses.MISSING_AUTHORIZATION();
  }

  let userId: string;

  try {
    ({ sub: userId } = await verifyJwt(token, { audience: 'at' }));
  } catch (err) {
    return responses.INVALID_AUTHORIZATION();
  }

  const { users } = await getDatabase();

  const { resources: [user] } = await users.items.query({
    query: `SELECT * FROM c WHERE c.id = @id`,
    parameters: [{ name: '@id', value: userId }],
  }).fetchAll();

  if (!user) {
    return responses.INVALID_AUTHORIZATION();
  }

  return responses.AUTHORIZED({
    user: withoutResource(user),
  });
}
