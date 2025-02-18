import { userSession } from '@components/stacks-session/connect';
import { STACKS_MAINNET } from '@stacks/network';

export const HOST =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://charisma.rocks';

export async function getContractMetadata(ca: string) {
  return await fetch(`${HOST}/api/metadata/${ca}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function setContractMetadata(ca: string, metadata: any) {
  // Get user data from session
  if (!userSession.isUserSignedIn()) {
    throw new Error('User must be signed in');
  }

  // Sign the contract ID
  const { showSignMessage } = await import('@stacks/connect');

  // Create a promise that resolves with the fetch response
  return new Promise((resolve, reject) => {
    showSignMessage({
      message: ca,
      network: STACKS_MAINNET,
      appDetails: {
        name: 'Charisma',
        icon: window.location.origin + '/charisma.png',
      },
      onFinish: async (data) => {
        try {
          console.log('Signature of the message', data.signature);
          console.log('Use public key:', data.publicKey);
          const response = await fetch(`${HOST}/api/v0/metadata/${ca}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-signature': data.signature,
              'x-public-key': data.publicKey,
            },
            body: JSON.stringify(metadata)
          });
          resolve(response);
        } catch (error) {
          reject(error);
        }
      },
    });
  });
}

export async function setIndexMetadata(ca: string, metadata: any) {
  return await fetch(`${HOST}/api/v0/indexes/${ca}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });
}


export async function setVaultMetadata(ca: string, metadata: any) {
  return await fetch(`${HOST}/api/v0/metadata/update/${ca}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });
}

export async function getLatestBlock() {
  const response = await fetch(`${HOST}/api/v0/blocks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function setLatestBlock(metadata: any) {
  const response = await fetch(`${HOST}/api/v0/blocks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });
  return response.json();
}

export async function getBalances(stxAddress: string) {
  const response = await fetch(`${HOST}/api/v0/balances/${stxAddress}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function uploadImage(formData: FormData) {
  return fetch('/api/v0/upload', {
    method: 'POST',
    body: formData
  });
}