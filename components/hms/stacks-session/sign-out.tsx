import React from 'react';
import Button from '../Button';
import { userSession } from 'pages/_app';

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
