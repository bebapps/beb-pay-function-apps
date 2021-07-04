import { Context, HttpRequest } from '@azure/functions';
import { verifyJwt } from '../core/auth/verifyJwt';
import { signJwt } from '../core/auth/signJwt';
import * as responses from '../core/responses/refreshTokens';
import { createRefreshToken } from '../core/auth/createRefreshToken';
import { createAccessToken } from '../core/auth/createAccessToken';

export default async function (context: Context, req: HttpRequest) {
  const [, token] = req.headers.authorization.split(' ');

  if (!token) {
    return responses.MISSING_AUTHORIZATION();
  }

  let userId: string;

  try {
    ({ sub: userId } = await verifyJwt(token, { audience: 'rt' }));
  } catch (err) {
    return responses.INVALID_AUTHORIZATION();
  }

  // TODO we could probably check whether the user still exists (but that functionality doesn't exist within the app anyway)

  const [refreshToken, accessToken] = await Promise.all([
    createRefreshToken(userId),
    createAccessToken(userId),
  ]);

  return responses.TOKENS_REFRESHED({
    authorization: {
      refreshToken,
      accessToken,
    },
  });
};
