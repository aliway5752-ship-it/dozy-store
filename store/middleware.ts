import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { API_URL } from "@/lib/config";

// Protecting specific routes (like checkout or profile)
// By default, we let users browse the store but protect sensitive areas
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/checkout(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if user is blocked
  const { userId } = await auth();
  if (userId) {
    try {
      const response = await fetch(`${API_URL}/profile?userId=${userId}`);
      if (response.ok) {
        const user = await response.json();
        if (user?.isBlocked) {
          return new Response('Your account has been blocked. Please contact support.', { status: 403 });
        }
      }
    } catch (error) {
      // If the check fails, allow the user to proceed (fail open)
      console.error('Error checking user block status:', error);
    }
  }

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
