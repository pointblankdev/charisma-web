// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/v0/nfts')) {
    const [, , , , ca, id] = request.nextUrl.pathname.split('/');
    const response = await fetch(`http://localhost:3000/api/v0/nfts/${ca}/${id}`);
    const data = await response.json();
    return NextResponse.json(data);
  }
}

export const config = {
  matcher: '/api/v0/nfts/:path*'
};
