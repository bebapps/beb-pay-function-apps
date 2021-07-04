export interface Store {
  name: string;
  userIds: string[];
  logo: string | null;
  branding: {
    [key: string]: string | number;
  };
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string | null;
  lastUpdatedBy: string | null;
}
