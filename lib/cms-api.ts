import { Job, Sponsor, Stage, Speaker } from '@lib/types';

import * as datoCmsApi from './cms-providers/dato';

let cmsApi: {
  getAllWallets: () => Promise<any[]>;
};

if (process.env.DATOCMS_READ_ONLY_API_TOKEN) {
  cmsApi = datoCmsApi;
}

export async function getAllWallets(): Promise<any[]> {
  return cmsApi.getAllWallets();
}