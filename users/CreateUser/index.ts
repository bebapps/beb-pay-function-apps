import { Context, HttpRequest } from '@azure/functions';
import { createUser } from '../core/functions/createUser';

export default async function (context: Context, req: HttpRequest) {
  context.res = await createUser(req.body);
};
