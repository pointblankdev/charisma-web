import styles from './index.module.css';
import { cn } from '@lib/utils';
import React, { ElementRef } from 'react';
import useClickOutside from '@lib/hooks/use-click-outside';
import InfoIcon from '@components/icons/icon-info';
import { Button } from '@components/ui/button';

const SignIn = ({ handleLogin }: any) => {
  React.useEffect(() => {
    setTimeout(() => {
      const el = document.getElementById('cta-btn');
      el?.classList.add('show-overlay');
      const tooltip = document.getElementById('cta-tooltip');
      tooltip?.classList.add('fade-in');
    }, 10000);
  }, []);
  const ctaRef = React.useRef<ElementRef<'button'>>(null);
  const clickedOutside = () => {
    const el = document.getElementById('cta-btn');
    const tooltip = document.getElementById('cta-tooltip');
    tooltip?.remove();
    el?.classList.remove('show-overlay');
  };
  useClickOutside(ctaRef, clickedOutside);
  return (
    <div>
      <Button ref={ctaRef} id="cta-btn" className={cn(styles['cta-btn'])} onClick={handleLogin}>
        Connect Wallet
      </Button>
      <div id="cta-tooltip" className={cn(styles['tooltip'])}>
        <InfoIcon />
        Click here to connect your Stacks wallet
      </div>
    </div >
  );
};

export default SignIn;
