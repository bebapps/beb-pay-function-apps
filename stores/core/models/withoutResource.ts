export function withoutResource<T>(resource: T): Omit<T, '_rid' | '_ts' | '_self' | '_etag' | '_attachments'> {
  const { _rid, _ts, _self, _etag, _attachments, ...data } = resource as any;
  return data;
}
