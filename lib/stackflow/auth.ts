// lib/auth.ts
export function verifySecret(headers: Headers): boolean {
    const SECRET_KEY = process.env.CHAINHOOK_SECRET_KEY;
    const authHeader = headers.get('authorization');
    return !!authHeader && authHeader === SECRET_KEY;
}