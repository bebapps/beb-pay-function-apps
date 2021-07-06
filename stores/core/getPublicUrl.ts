import { getConfiguration } from './getConfiguration';

let publicUrl = '';

// TODO potential race condition (solution would be to expose a function to add any promises that need to happen before processing any requests - and then await "all" the promises in each function handler)
getConfiguration().then(({ PUBLIC_URL }) => {
  publicUrl = PUBLIC_URL;
});

export function getPublicUrl(path: string) {
  return publicUrl + path;
}
