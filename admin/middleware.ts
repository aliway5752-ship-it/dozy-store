import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Allow all GET requests to API routes (store frontend data fetching)
  if (req.nextUrl.pathname.startsWith('/api') && req.method === 'GET') {
    return;
  }
  // Allow PATCH on cancel routes (public customer-facing cancellation)
  if (req.nextUrl.pathname.endsWith('/cancel') && req.method === 'PATCH') {
    return;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};