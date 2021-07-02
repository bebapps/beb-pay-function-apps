import * as jsonwebtoken from 'jsonwebtoken';
import { signingSecret } from './signingSecret';

export interface SignOptions {
  audience: string;
  expiresIn: number;
}

export function signJwt(userId: string, options: SignOptions) {
  return new Promise(async (resolve, reject) => {
    try {
      const expiryDate = new Date(Date.now() + options.expiresIn);

      jsonwebtoken.sign(
        {
          exp: Math.floor(expiryDate.getTime() / 1000),
        },
        await signingSecret,
        {
          audience: options.audience,
          subject: userId,
        },
        (err, token) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              expiryDate,
              token,
            });
          }
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}
