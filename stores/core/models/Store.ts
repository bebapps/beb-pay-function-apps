import { Resource } from '@azure/cosmos';
import { getPublicUrl } from '../getPublicUrl';

export interface Store {
  name: string;
  status: 'inactive' | 'active';
  country: string | null;
  currency: string | null;
  userIds: string[];
  logo: string | null;
  branding: {
    [key: string]: string | number | boolean;
  };
  wallet: {
    id: `ewallet_${string}`;
  };
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string | null;
  lastUpdatedBy: string | null;
}

export function mapStore(store: Store & Resource) {
  return {
    id: store.id,
    status: store.status,
    name: store.name,
    logo: store.logo && getPublicUrl(store.logo),
    branding: store.branding,
    country: store.country,
    currency: store.currency,
    url: getPublicUrl('/' + store.id),
  };
}
