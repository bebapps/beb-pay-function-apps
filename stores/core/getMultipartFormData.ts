import { HttpRequest } from '@azure/functions';
import * as multipart from 'multipart-formdata';

export interface File {
  name: string;
  contentType: string;
  value: Buffer;
};

export interface Files {
  [name: string]: File | File[];
}

export function getMultipartFormData(req: HttpRequest) {
  const [, boundary] = req.headers['content-type'].split('boundary=');
  const parsed = multipart.parse(req.body, boundary);

  const fields: { [name: string]: any } = Object.create(null);
  const files: Files = Object.create(null);

  for (const data of parsed) {
    let category: object;
    let key = data.name;
    let value;

    if (data.field) {
      category = fields;
      value = data.field;
    } else if (data.type) {
      category = files;
      value = {
        name: data.filename,
        contentType: data.type,
        value: data.data,
      };
    }

    if (key.endsWith('[]')) {
      key = key.substring(0, key.length - 2);
      value = [
        ...(category[key] || []),
        value,
      ];
    }

    category[key] = value;
  }

  return [fields, files];
}
