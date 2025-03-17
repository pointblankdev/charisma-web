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
  "/privacy-policy",
  "/set-extension",
  // Static files pattern - ensure all file types in public directory are accessible
  '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|GIF|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf|mp4|mp3|json)).*)',
  // API routes
  '/(api|trpc)(.*)',
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