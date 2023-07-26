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
import { nanoid } from 'nanoid';
import { ConfUser } from '@lib/types';
import validator from 'validator';
import { COOKIE } from '@lib/constants';
import cookie from 'cookie';
import ms from 'ms';
import { getTicketNumberByUserId, getUserById, createUser, createWallet, updateUserWithWallet } from '@lib/db-api';
import { emailToId } from '@lib/user-api';
import { validateCaptchaResult, IS_CAPTCHA_ENABLED } from '@lib/captcha';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function linkWallet(
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
  const wallet: any = req.body.wallet;
  const user: any = req.body.user;

  await createWallet(wallet, wallet.decentralizedID)
  await updateUserWithWallet(user.id, wallet.decentralizedID, user.ticketNumber)

  return res.status(200).json({});
}
