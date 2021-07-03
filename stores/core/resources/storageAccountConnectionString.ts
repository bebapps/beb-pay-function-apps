import { getConfiguration } from '../getConfiguration';

export const storageAccountConnectionString = getConfiguration()
  .then(({ RESOURCES_STORAGE_ACCOUNT_CONNECTION_STRING }) => RESOURCES_STORAGE_ACCOUNT_CONNECTION_STRING);
