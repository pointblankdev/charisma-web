import { Job, Sponsor, Stage, Speaker } from '@lib/types';

import * as datoCmsApi from './cms-providers/dato';

let cmsApi: {
  getAllWallets: () => Promise<any[]>;
  getAllQuests: () => Promise<any[]>;
  getAllGuilds: () => Promise<any[]>;
};

if (process.env.DATOCMS_READ_ONLY_API_TOKEN) {
  cmsApi = datoCmsApi;
}

export async function getAllWallets(): Promise<any[]> {
  return cmsApi.getAllWallets();
}

export async function getAllQuests(): Promise<any[]> {
  return cmsApi.getAllQuests();
}

export async function getAllGuilds(): Promise<any[]> {
  return cmsApi.getAllGuilds();
}