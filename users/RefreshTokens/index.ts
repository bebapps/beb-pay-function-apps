import { Context, HttpRequest } from '@azure/functions';
import { verifyJwt } from '../core/auth/verifyJwt';
import { createRefreshToken } from '../core/auth/createRefreshToken';
import { createAccessToken } from '../core/auth/createAccessToken';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';

const TOKENS_REFRESHED = createSuccessResponse(
  'TOKENS_REFRESHED',
  'Successfully refreshed tokens.',
);

const MISSING_AUTHORIZATION = createErrorResponse(
  'USER_ERROR_MISSING_AUTHORIZATION',
  'Authorization header missing.',
  400,
);

const INVALID_AUTHORIZATION = createErrorResponse(
  'USER_ERROR_INVALID_AUTHORIZATION',
  'Authorization invalid. Your refresh token may have expired.',
  400,
);

export default async function (context: Context, req: HttpRequest) {
  const [, token] = req.headers.authorization.split(' ');

  if (!token) {
    return MISSING_AUTHORIZATION();
  }

  let userId: string;

  try {
    ({ sub: userId } = await verifyJwt(token, { audience: 'rt' }));
  } catch (err) {
    return INVALID_AUTHORIZATION();
  }

  // TODO we could probably check whether the user still exists (but that functionality doesn't exist within the app anyway)

  const [refreshToken, accessToken] = await Promise.all([
    createRefreshToken(userId),
    createAccessToken(userId),
  ]);

  return TOKENS_REFRESHED({
    authorization: {
      refreshToken,
      accessToken,
    },
  });
};
