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
  return await fetch(`${HOST}/api/metadata/${ca}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
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

export async function getExperienceHolders() {
  const response = await fetch(`${HOST}/api/v0/experience`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export const saveSession = async (dehydratedState: string) => {
  await fetch(`${HOST}/api/v0/session/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dehydratedState })
  });
};

export const destroySession = async () => {
  try {
    await fetch(`${HOST}/api/v0/session/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: null
    });
  } catch (e) {
    console.log(e);
  }
};

export const setNftItemMetadata = async (
  contractAddress: string,
  id: number | string,
  metadata: any
) => {
  const response = await fetch(`${HOST}/api/v0/nfts/${contractAddress}/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });
  return response.json();
};

export const setNftCollectionMetadata = async (contractAddress: string, metadata: any) => {
  const response = await fetch(`${HOST}/api/v0/nfts/${contractAddress}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });
  return response.json();
};

export const getNftCollectionMetadata = async (contractAddress: string) => {
  const response = await fetch(`${HOST}/api/v0/nfts/${contractAddress}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

export const syncLandBalances = async ({ id, address }: any) => {
  const response = await fetch(`${HOST}/api/v0/lands/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, address })
  });
  return response.json();
};
