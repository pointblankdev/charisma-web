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