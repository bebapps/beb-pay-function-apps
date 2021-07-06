import { RapydClient } from '@bebapps/rapyd-sdk';
import { getConfiguration } from '../getConfiguration';

export async function getRapydClient() {
  const { RAPYD_SECRET_KEY, RAPYD_ACCESS_KEY } = await getConfiguration();
  return new RapydClient(RAPYD_SECRET_KEY, RAPYD_ACCESS_KEY);
}
