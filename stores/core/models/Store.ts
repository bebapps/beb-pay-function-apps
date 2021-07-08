import { Resource } from '@azure/cosmos';
import { getPublicUrl } from '../getPublicUrl';

export interface Store {
  name: string;
  status: 'inactive' | 'active';
  description: string | null;
  country: string | null;
  currency: string | null;
  userIds: string[];
  logo: string | null;
  branding: {
    [key: string]: string | number | boolean;
  };
  wallet: {
    id: `ewallet_${string}`;
    balances: {
      [currency: string]: number;
    };
  };
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string | null;
  lastUpdatedBy: string | null;
}

export function mapStore(store: Store & Resource, permission: 'admin' | 'guest') {
  return {
    id: store.id,
    status: store.status,
    name: store.name,
    description: store.description,
    logo: store.logo && getPublicUrl(store.logo),
    branding: store.branding,
    country: store.country,
    currency: store.currency,
    url: getPublicUrl('/' + store.id),
    balances: permission === 'admin'
      ? store.wallet.balances
      : undefined,
  };
}
