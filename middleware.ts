import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/swap",
  "/tokens",
  "/vaults",
  "/meme-tools",
  "/rulebook",
  '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  '/(api|trpc)(.*)',
  '/(.*)'
];

// Create a route matcher for public routes
const isPublicRoute = createRouteMatcher(publicRoutes);

// Create middleware with auth handling
export default clerkMiddleware(async (auth, req) => {
  // Check if the route is public or if the user is authenticated
  if (!isPublicRoute(req) && !(await auth()).userId) {
    // Redirect to sign-in for protected routes when not authenticated
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Continue for public routes or authenticated users
  return NextResponse.next();
});