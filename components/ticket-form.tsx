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

import { useState, useRef } from 'react';
import { scrollTo } from '@lib/smooth-scroll';
import cn from 'classnames';
import StacksIcon from '@components/icons/icon-stacks';
import CheckIcon from '@components/icons/icon-check';
import { TicketGenerationState } from '@lib/constants';
import isMobileOrTablet from '@lib/is-mobile-or-tablet';
import useConfData from '@lib/hooks/use-conf-data';
import LoadingDots from './loading-dots';
import formStyles from './form.module.css';
import ticketFormStyles from './ticket-form.module.css';
import { linkWallet } from '@lib/user-api';
import { useConnect } from "@stacks/connect-react";
import { appDetails } from 'pages/_app';

type FormState = 'default' | 'loading' | 'error';

type Props = {
  defaultUsername?: string;
  setTicketGenerationState: React.Dispatch<React.SetStateAction<TicketGenerationState>>;
};

const githubEnabled = Boolean(process.env.NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID);

export default function Form({ defaultUsername = '', setTicketGenerationState }: Props) {
  const [username, setUsername] = useState(defaultUsername);
  const [formState, setFormState] = useState<FormState>('default');
  const [errorMsg, setErrorMsg] = useState('');
  const { userData, setUserData } = useConfData();
  const formRef = useRef<HTMLFormElement>(null);


  const { sign, authenticate } = useConnect();

  const handleLogin = () => {
    authenticate({
      appDetails,
      onFinish: async ({ userSession }) => {
        if (!userSession) {
          setFormState('default');
          setTicketGenerationState('default');
          return;
        }

        const user = userSession.loadUserData()

        document.body.classList.add('ticket-generated');
        const name = user.profile.stxAddress.mainnet
        setUserData({ ...userData, username: name, name: name });
        setUsername(name);
        setFormState('default');
        setTicketGenerationState('default');

        // Prefetch GitHub avatar
        new Image().src = `https://github.com/${name}.png`;

        // Prefetch the twitter share URL to eagerly generate the page
        fetch(`/tickets/${userData.id}`).catch(_ => { });

        if (userData.id && user.decentralizedID && userData.ticketNumber) {
          await linkWallet({ wallet: user, user: userData })
        }
      },
    });
  };

  return formState === 'error' ? (
    <div>
      <div className={cn(formStyles['form-row'], ticketFormStyles['form-row'])}>
        <div className={cn(formStyles['input-label'], formStyles.error)}>
          <div className={cn(formStyles.input, formStyles['input-text'])}>{errorMsg}</div>
          <button
            type="button"
            className={cn(formStyles.submit, formStyles.error)}
            onClick={() => {
              setFormState('default');
              setTicketGenerationState('default');
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  ) : (
    <form
      ref={formRef}
      onSubmit={e => {
        e.preventDefault();

        if (formState !== 'default') {
          setTicketGenerationState('default');
          setFormState('default');
          return;
        }

        setFormState('loading');
        setTicketGenerationState('loading');

        handleLogin()
      }}
    >
      <div className={cn(formStyles['form-row'], ticketFormStyles['form-row'])}>
        <div className={cn(formStyles['stacks-wrapper'])}>
          <button
            type="submit"
            className={cn(
              formStyles.submit,
              formStyles['generate-with-stacks'],
              formStyles[formState],
              {
                [formStyles['not-allowed']]: !githubEnabled
              }
            )}
            disabled={
              !process.env.NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID ||
              formState === 'loading' ||
              Boolean(username)
            }
            onClick={() => {
              if (formRef && formRef.current && isMobileOrTablet()) {
                scrollTo(formRef.current, formRef.current.offsetHeight);
              }
            }}
          >
            <div className={ticketFormStyles.generateWithStacks}>
              <span className={ticketFormStyles.stacksIcon}>
                <StacksIcon color="#fff" size={24} />
              </span>
              {formState === 'loading' ? (
                <LoadingDots size={4} />
              ) : (
                !!username ? `${username.slice(0, 4)}...${username.slice(-4)}` : 'Connect with Stacks'
              )}
            </div>
            {username ? (
              <span className={ticketFormStyles.checkIcon}>
                <CheckIcon color="#fff" size={24} />
              </span>
            ) : null}
          </button>
          <p className={ticketFormStyles.description}>
            Only public info will be used.
          </p>
        </div>
      </div>
    </form>
  );
}
