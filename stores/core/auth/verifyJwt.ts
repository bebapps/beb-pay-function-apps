import * as jsonwebtoken from 'jsonwebtoken';
import { signingSecret } from './signingSecret';

export interface VerifyOptions {
  audience: string;
}

export function verifyJwt(token: string, options: VerifyOptions) {
  return new Promise<jsonwebtoken.JwtPayload>(async (resolve, reject) => {
    try {
      jsonwebtoken.verify(
        token,
        await signingSecret,
        {
          audience: options.audience,
        },
        (err, claims) => {
          if (err) {
            reject(err);
          } else {
            resolve(claims);
          }
        },
      );
    } catch (err) {
      reject(err);
    }
  });
}
