import { getConfiguration } from '../getConfiguration';

export const signingSecret = getConfiguration()
  .then(({ JWT_SIGNING_SECRET }) => Buffer.from(JWT_SIGNING_SECRET, 'base64'));
