// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/v0/nfts')) {
    const [, , , , ca, id] = request.nextUrl.pathname.split('/');
    return NextResponse.rewrite(`https://charisma.rocks/api/v1/nfts/${ca}/${id}`);
  }
}

export const config = {
  matcher: '/api/v0/nfts/:path*'
};
