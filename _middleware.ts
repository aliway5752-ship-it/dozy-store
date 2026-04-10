export const config = { runtime: 'nodejs' };

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }
  auth.protect();
});