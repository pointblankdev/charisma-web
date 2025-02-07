import { IncomingHttpHeaders } from "http";

// lib/auth.ts
export function verifySecret(headers: IncomingHttpHeaders): boolean {
    const SECRET_KEY = process.env.CHAINHOOK_SECRET_KEY;
    const authHeader = headers.authorization
    return !!authHeader && authHeader === SECRET_KEY;
}