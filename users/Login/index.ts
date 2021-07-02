import { Context, HttpRequest } from '@azure/functions';
import { login } from '../core/functions/login';

export default async function (context: Context, req: HttpRequest) {
  context.res = await login(req.body);
};
