import crypto from 'crypto';

export async function register(email: string, token?: string) {
  return await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, token })
  });
}

export async function linkWallet({ wallet, user }: { wallet: any; user: any }) {
  return await fetch('/api/link-wallet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      wallet,
      user
    })
  });
}

export async function newWallet({ wallet }: { wallet: any }) {
  return await fetch('/api/new-wallet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      wallet
    })
  });
}

export function emailToId(email: string) {
  if (process.env.EMAIL_TO_ID_SECRET) {
    const hmac = crypto.createHmac('sha1', process.env.EMAIL_TO_ID_SECRET);
    hmac.update(email);
    const result = hmac.digest('hex');
    return result;
  } else {
    throw new Error('EMAIL_TO_ID_SECRET is missing');
  }
}

export async function createQuestDraft(args: any) {
  return await fetch('/api/create-quest-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
}

export async function updateQuest(args: any) {
  return await fetch('/api/update-quest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
}

export async function createQuestSession(args: any) {
  return await fetch('/api/create-quest-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
}

export async function getQuestById(args: any) {
  return await fetch(`/api/get-quest-by-id/${args.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function getQuestsByOwner(address: string) {
  return await fetch(`/api/get-quests-by-owner/${address}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function getContractMetadata(ca: string) {
  return await fetch(`https://charisma.rocks/api/metadata/${ca}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function setContractMetadata(ca: string, metadata: any) {
  return await fetch(`https://charisma.rocks/api/metadata/${ca}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });
}