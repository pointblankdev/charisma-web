import React from 'react';
import { userSession } from 'pages/_app';
import { Button } from '@components/ui/button';

const SignOut = () => {

  return (
    <div className="flex items-center space-x-4">
      <Button className='className="h-[40px]"' variant="secondary" onClick={() => userSession.signUserOut('/')}>
        Sign Out
      </Button>
    </div>
  );
};

export default SignOut;
