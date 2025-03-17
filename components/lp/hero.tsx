
import { cn } from '@lib/utils';
import styleUtils from '@components/utils.module.css';
import styles from './hero.module.css';
import { BRAND_NAME, FUNNY_QUOTE, META_DESCRIPTION } from '@lib/constants';
import Image from 'next/image';
import charisma from '@public/charisma.png';
import { SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@components/ui/button';

const SignedIn = ClerkSignedIn as any
const SignedOut = ClerkSignedOut as any

export default function Hero() {
  return (
    <div className={cn(styles.wrapper, 'z-10 relative')}>
      <h2
        className={cn(
          styleUtils.appear,
          styleUtils['appear-first'],
          styles.description,
          styleUtils['hide-on-mobile'],
          styleUtils['hide-on-tablet'],
        )}
      >
        {META_DESCRIPTION}
      </h2>
      <div className={cn(styles.heroContainer, 'space-x-1')}>
        <Image src={charisma} alt="Logo" width="75" height="75" className={cn(styleUtils.appear, styleUtils['appear-third'])} />{' '}
        <span className={cn(styleUtils.appear, styleUtils['appear-third'], styles.hero)}>
          {BRAND_NAME}
        </span>
        <span className={cn(styleUtils.appear, styleUtils['appear-third'])}>{' '}CHA</span>
      </div>
      <h2
        className={cn(
          styleUtils.appear,
          styleUtils['appear-first'],
          styles.description,
          styleUtils['show-on-mobile'],
          styleUtils['show-on-tablet'],
        )}
      >
        {META_DESCRIPTION}
      </h2>
      <div className={cn(styleUtils.appear, styleUtils['appear-eighth'], styles.about)}>
        <em>{FUNNY_QUOTE}</em>
      </div>

      {/* Authentication buttons */}
      <SignedOut>
        <div className={cn(styleUtils.appear, styleUtils['appear-fourth'], "flex justify-center gap-4 mt-8")}>
          <SignUpButton mode="modal" fallbackRedirectUrl="/swap">
            <Button className="min-w-32 justify-center" size="lg" variant="default">
              Sign Up
            </Button>
          </SignUpButton>
          <SignInButton mode="modal" fallbackRedirectUrl="/swap">
            <Button className="min-w-32 justify-center" size="lg" variant="outline">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className={cn(styleUtils.appear, styleUtils['appear-fourth'], "flex justify-center gap-4 mt-8")}>
          <Button className="min-w-32 justify-center" size="lg" variant="default">
            Exchange
          </Button>
          <Button className="min-w-32 justify-center" size="lg" variant="outline">
            Earn Rewards
          </Button>
        </div>
      </SignedIn>
    </div>
  );
}
