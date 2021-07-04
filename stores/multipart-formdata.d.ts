declare module 'multipart-formdata' {
  export function parse(buff: Buffer, boundary: string): {
    data: Buffer;
    field: string;
    filename: string;
    name: string;
    type: string;
  }[];
}
