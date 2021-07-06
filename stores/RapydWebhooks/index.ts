import { Context, HttpRequest } from '@azure/functions';

export default async function (context: Context, req: HttpRequest) {
  context.log(req);
  return { status: 200, body: 'OK' };
};
