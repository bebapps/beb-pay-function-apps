import ms from 'ms';
import { signJwt } from './signJwt';

const refreshTokenTtl = ms('1 week');

export function createRefreshToken(userId: string) {
  return signJwt(userId, {
    audience: 'rt',
    expiresIn: refreshTokenTtl,
  });
}
