/*
 * Authentication Middleware Configuration
 * --------------------------------------
 * This file controls which routes require authentication and which are public.
 * 
 * Development Options:
 * 1. Uncomment the '/(.*)', line in the publicRoutes array to allow all routes without authentication
 * 2. Set NEXT_PUBLIC_DISABLE_AUTH=true in your .env to add all routes to public routes
 * 3. Set NEXT_PUBLIC_BYPASS_AUTH=true in your .env to completely bypass auth checks
 * 
 * To add new public routes:
 * - Add the route path to the publicRoutes array
 * - For file extensions, add them to the static files pattern regex
 */

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

// If NEXT_PUBLIC_DISABLE_AUTH is set to "true", add a wildcard route to allow all routes
if (process.env.NEXT_PUBLIC_DISABLE_AUTH === "true") {
  publicRoutes.push('/(.*)')
}

// Create a route matcher for public routes
const isPublicRoute = createRouteMatcher(publicRoutes);

// Maintenance mode redirect
const maintenanceMatcher = createRouteMatcher([
  // Match any route that is NOT API, _next, static file, or maintenance page
  '/((?!_next|api|maintenance|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf|mp4|mp3|json)).*)'
]);

// Create middleware with auth handling
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // If the request matches maintenanceMatcher, redirect to /maintenance
  // if (maintenanceMatcher(req)) {
  //   const maintenanceUrl = new URL('/maintenance', req.url);
  //   return NextResponse.rewrite(maintenanceUrl);
  // }

  // For development environment, you can bypass auth completely
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return NextResponse.next();
  }

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