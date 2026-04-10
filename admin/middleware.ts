import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const ALLOWED_EMAILS = [
  'ali.way.5752@gmail.com',
  'second-admin@example.com',
];

const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  const session = await auth();
  const userEmail = session.sessionClaims?.email as string | undefined;

  if (userEmail && !ALLOWED_EMAILS.includes(userEmail)) {
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.warn(`Unauthorized admin access attempt: Email=${userEmail}, IP=${ipAddress}, Path=${req.nextUrl.pathname}`);
    
    return new Response('Forbidden: You are not authorized to access this admin panel', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};