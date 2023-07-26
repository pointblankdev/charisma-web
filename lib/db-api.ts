/**
 * Copyright 2020 Vercel Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ConfUser } from '@lib/types';

import * as kvApi from './db-providers/kv';

let dbApi: {
  createUser: (id: string, email: string) => Promise<ConfUser>;
  getUserById: (id: string) => Promise<ConfUser>;
  getTicketNumberByUserId: (id: string) => Promise<string | null>;
  createWallet: (data: any, did: string) => Promise<string>;
  updateUserWithWallet: (id: string, did: string, ticketNumber: number) => Promise<ConfUser>;
};

if (process.env.KV_URL) {
  dbApi = kvApi;
}

export async function createUser(id: string, email: string): Promise<ConfUser> {
  return dbApi.createUser(id, email);
}

export async function getUserById(id: string): Promise<ConfUser> {
  return dbApi.getUserById(id);
}

export async function getTicketNumberByUserId(id: string): Promise<string | null> {
  return dbApi.getTicketNumberByUserId(id);
}

export async function createWallet(wallet: any, did: string): Promise<string> {
  return dbApi.createWallet(wallet, did);
}

export async function updateUserWithWallet(
  id: string,
  did: string,
  ticketNumber: number
): Promise<ConfUser> {
  return dbApi.updateUserWithWallet(id, did, ticketNumber);
}
