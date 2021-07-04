import { HttpRequest } from '@azure/functions';
import * as multipart from 'multipart-formdata';

export interface FormDataItem {
  value: Buffer;
  contentType: string,
  fileName?: string;
}

export type FormData = Map<string, FormDataItem>;

export function getMultipartFormData(req: HttpRequest): FormData {
  const [, boundary] = req.headers['content-type'].split('boundary=');
  const fields = multipart.parse(req.body, boundary);

  return fields.reduce((formData, field) => {
    formData.set(field.name, {
      value: field.data,
      contentType: field.type,
      fileName: field.filename,
    });
    return formData;
  }, new Map());
}
