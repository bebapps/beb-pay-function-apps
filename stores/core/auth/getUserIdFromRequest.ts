import { HttpRequest } from '@azure/functions';
import { verifyJwt } from './verifyJwt';

export async function getUserIdFromRequest(req: HttpRequest, isRequired: boolean = true) {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.split(' ');

  if (!token) {
    if (isRequired) {
      throw new Error('Missing authorization.');
    }
    return null;
  }

  let userId: string;

  try {
    ({ sub: userId } = await verifyJwt(token, { audience: 'at' }));
  } catch (err) {
    throw new Error('Invalid authorization.');
  }

  return userId;
}
