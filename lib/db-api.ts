import * as dataApi from './db-providers/dato';

let dbApi: {
  createUser: (user: any) => Promise<any>;
  getUserById: (id: string) => Promise<any>;
  createWallet: (wallet: any) => Promise<any>;
  updateUserWithWallet: (userId: string, walletId: string) => Promise<any>;
};

if (process.env.DATOCMS_FULL_ACCESS_API_TOKEN) {
  dbApi = dataApi;
}

export async function createUser(user: any): Promise<any> {
  return dbApi.createUser(user);
}

export async function getUserById(id: string): Promise<any> {
  return dbApi.getUserById(id);
}

export async function createWallet(wallet: any): Promise<any> {
  return dbApi.createWallet(wallet);
}

export async function updateUserWithWallet(userId: string, walletId: string): Promise<any> {
  return dbApi.updateUserWithWallet(userId, walletId);
}
