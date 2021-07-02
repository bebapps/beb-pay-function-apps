import ms from 'ms';
import { signJwt } from './signJwt';

const accessTokenTtl = ms('5 mins');

export function createAccessToken(userId: string) {
  return signJwt(userId, {
    audience: 'at',
    expiresIn: accessTokenTtl,
  });
}
