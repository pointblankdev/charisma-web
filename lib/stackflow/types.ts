export interface Channel {
    id: string;
    principal_1: string;
    principal_2: string;
    token: string | null;
    balance_1: string;
    balance_2: string;
    nonce: number;
    expires_at: string | null;
    state: 'open' | 'closing' | 'closed';
}

export interface Signature {
    channel: string;
    balance_1: string;
    balance_2: string;
    nonce: number;
    action: number;
    actor: string;
    secret?: string;
    owner_signature: string;
    other_signature: string;
}

export interface PendingSignature extends Signature {
    hashed_secret: string;
    depends_on_channel: string;
    depends_on_nonce: string;
}