import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protecting specific routes (like checkout or profile)
// By default, we let users browse the store but protect sensitive areas
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/checkout(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
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
