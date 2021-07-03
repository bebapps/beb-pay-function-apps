import { HttpRequest } from '@azure/functions';
import { verifyJwt } from './verifyJwt';

export async function getUserIdFromRequest(req: HttpRequest) {
  const [, token] = req.headers.authorization.split(' ');

  if (!token) {
    throw new Error('Missing authorization.');
  }

  let userId: string;

  try {
    ({ sub: userId } = await verifyJwt(token, { audience: 'at' }));
  } catch (err) {
    throw new Error('Invalid authorization.');
  }

  return userId;
}
