
import { useState, useRef, useEffect } from 'react';
import { scrollTo } from '@lib/smooth-scroll';
import { cn } from '@lib/utils';
import StacksIcon from '@components/icons/icon-stacks';
import CheckIcon from '@components/icons/icon-check';
import isMobileOrTablet from '@lib/is-mobile-or-tablet';
import useConfData from '@lib/hooks/use-conf-data';
import LoadingDots from '@components/loading-dots';
import formStyles from './form.module.css';
import ticketFormStyles from './whitelist-form.module.css';
import { linkWallet } from '@lib/user-api';
import { showConnect } from "@stacks/connect-react";
import { appDetails, userSession } from 'pages/_app';
import { Button } from '@components/ui/button';

type FormState = 'default' | 'loading' | 'error';

export default function WhitelistForm() {
  const [username, setUsername] = useState('');
  const [formState, setFormState] = useState<FormState>('default');
  const [errorMsg, setErrorMsg] = useState('');
  const { userData, setUserData } = useConfData();
  const formRef = useRef<HTMLFormElement>(null);

  function authenticate() {
    showConnect({
      appDetails,
      redirectTo: "/",
      onFinish: async ({ userSession }) => {
        if (!userSession) {
          return;
        }
        const wallet = userSession.loadUserData()
        const name = wallet.profile.stxAddress.mainnet
        setUserData({ ...userData, username: name, name: name });
        setUsername(name);
        setFormState('default');
        await linkWallet({ wallet: wallet, user: userData })
      },
      userSession,
    });
  }

  function disconnect() {
    userSession.signUserOut("/");
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return formState === 'error' ? (
    <div>
      <div className={cn(formStyles['form-row'], ticketFormStyles['form-row'])}>
        <div className={cn(formStyles['input-label'], formStyles.error)}>
          <div className={cn(formStyles.input, formStyles['input-text'])}>{errorMsg}</div>
          <Button
            type="button"
            className={cn(formStyles.submit, formStyles.error)}
            onClick={() => {
              setFormState('default');
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <form
      ref={formRef}
      onSubmit={e => {
        e.preventDefault();

        if (formState !== 'default') {
          setFormState('default');
          return;
        }

        setFormState('loading');

        authenticate()
      }}
    >
      {mounted && <div className={cn(formStyles['form-row'], ticketFormStyles['form-row'])}>
        <div className={cn(formStyles['stacks-wrapper'])}>
          <Button
            type="submit"
            className={cn(
              formStyles.submit,
              formStyles['generate-with-stacks'],
              formStyles[formState],
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
                <StacksIcon size={24} />
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
          </Button>
        </div>
      </div>}
    </form>
  );
}
