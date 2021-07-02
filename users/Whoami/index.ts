import { Context, HttpRequest } from '@azure/functions';
import { whoami } from '../core/functions/whoami';

export default async function (context: Context, req: HttpRequest) {
  context.res = await whoami(req.headers.authorization);
};
