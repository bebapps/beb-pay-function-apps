import { HttpRequest } from '@azure/functions';
import { Files, getMultipartFormData } from './getMultipartFormData';

export function getBody<T extends any>(req: HttpRequest): [T, Files] {
  if (Buffer.isBuffer(req.body)) {
    return getMultipartFormData(req) as any;
  } else {
    return [
      Object.assign(Object.create(null), req.body),
      Object.create(null),
    ];
  }
}
