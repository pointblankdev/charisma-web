import React from 'react';
import { Button } from '@components/ui/button';
import { SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut, SignInButton, UserButton } from "@clerk/nextjs"

const SignedIn = ClerkSignedIn as any
const SignedOut = ClerkSignedOut as any

// Store stacks connection functionality but don't expose it in main UI
// This import will only be used in the settings page
export const { connect, disconnect, isConnected } = await import('@stacks/connect');

// This function is maintained for use in the settings page
export function toggleSession() {
  if (isConnected()) {
    disconnect();
  } else {
    connect();
  }
}

// Component is simplified to only show Clerk auth UI
const ConnectWallet = () => {
  return (
    <div className="flex items-center">
      <SignedOut>
        <Button variant="outline" size="sm" className="rounded-full px-4">
          <SignInButton />
        </Button>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
};

export default ConnectWallet;