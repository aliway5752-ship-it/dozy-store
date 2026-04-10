# Vercel Environment Variables Setup

## Critical Issue Fixed
The MIDDLEWARE_INVOCATION_FAILED error was caused by adding `runtime: 'nodejs'` to the middleware configuration. **Middleware in Next.js always runs on the edge runtime and does not support runtime configuration.** This has been removed from admin/middleware.ts.

## Required Environment Variables for Admin Dashboard

### Clerk Authentication (CRITICAL for Middleware)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
AUTH_SECRET=your-auth-secret
CLERK_WEBHOOK_SECRET=whsec_...
```

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### Stripe
```
STRIPE_API_KEY=sk_test_... or sk_live_...
```

### Cloudinary
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### Store URLs (IMPORTANT for Production)
```
FRONTEND_STORE_URL=https://your-vercel-app.vercel.app
```
**Note:** This MUST be your Vercel URL in production, NOT localhost.

## Required Environment Variables for Store Frontend

### Clerk Authentication (CRITICAL for Middleware)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
AUTH_SECRET=your-auth-secret
CLERK_WEBHOOK_SECRET=whsec_...
```

### API Connection
```
NEXT_PUBLIC_API_URL=https://your-admin-vercel-app.vercel.app
```

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database
```

## Clerk Configuration Settings

### In Clerk Dashboard:
1. **Allowed Origins:**
   - Add your admin Vercel URL: `https://your-admin-app.vercel.app`
   - Add your store Vercel URL: `https://your-store-app.vercel.app`

2. **Sign In URLs:**
   - Admin: `https://your-admin-app.vercel.app/sign-in`
   - Store: `https://your-store-app.vercel.app/sign-in`

3. **Sign Up URLs:**
   - Admin: `https://your-admin-app.vercel.app/sign-up`
   - Store: `https://your-store-app.vercel.app/sign-up`

4. **Redirect URLs:**
   - Admin: `https://your-admin-app.vercel.app`
   - Store: `https://your-store-app.vercel.app`

5. **Webhook URL:**
   - Admin: `https://your-admin-app.vercel.app/api/webhooks/clerk`
   - Store: `https://your-store-app.vercel.app/api/webhooks/clerk`

## Production Checklist

- [ ] Remove `runtime: 'nodejs'` from middleware (DONE)
- [ ] Set FRONTEND_STORE_URL to Vercel URL (not localhost)
- [ ] Set NEXT_PUBLIC_API_URL to admin Vercel URL
- [ ] Add all Clerk environment variables to Vercel
- [ ] Configure Clerk dashboard with production URLs
- [ ] Update Clerk webhook endpoints to production URLs
- [ ] Set DATABASE_URL to production database
- [ ] Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- [ ] Set STRIPE_API_KEY to production key if using live mode

## Common Issues

1. **MIDDLEWARE_INVOCATION_FAILED:**
   - Caused by unsupported runtime config in middleware
   - Solution: Remove runtime config from middleware

2. **Clerk Authentication Failures:**
   - Missing or incorrect Clerk keys
   - Allowed origins not configured
   - Redirect URLs not set

3. **Database Connection Issues:**
   - DATABASE_URL not set or incorrect
   - Database not accessible from Vercel

4. **Webhook Failures:**
   - Webhook secret not set
   - Webhook URL not configured in Clerk dashboard
