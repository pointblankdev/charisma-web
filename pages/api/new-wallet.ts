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

import { NextApiRequest, NextApiResponse } from 'next';
import { ConfUser } from '@lib/types';
import { createWallet } from '@lib/db-api';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function newWallet(
  req: NextApiRequest,
  res: NextApiResponse<ConfUser | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(501).json({
      error: {
        code: 'method_unknown',
        message: 'This endpoint only responds to POST'
      }
    });
  }

  try {
    await createWallet({ log: JSON.stringify(req.body.wallet), stxaddress: req.body.wallet.stxAddress.mainnet })
  } catch (error: any) {
    console.error(error.message)
  }

  return res.status(200).json({});
}
