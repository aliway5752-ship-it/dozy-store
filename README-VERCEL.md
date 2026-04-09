# Vercel Deployment Guide

This repository has been configured for Vercel deployment with Prisma data proxy to avoid local database connection issues (P1001 error).

## Key Changes Made

### 1. Prisma Configuration
- Updated `admin/prisma/schema.prisma` to use `engineType = "dataProxy"`
- Modified build scripts to use `prisma generate --no-engine`
- Created Vercel-compatible database client utilities

### 2. Build Scripts
- `admin/package.json`: Updated build script for Vercel compatibility
- Added separate `build:local` script for local development
- Added database management scripts (`db:generate`, `db:push`, `db:migrate`)

### 3. Vercel Configuration
- Created `vercel.json` with proper build configuration
- Added `.vercelignore` to exclude unnecessary files
- Set `PRISMA_GENERATE_DATAPROXY=true` environment variable

### 4. Environment Setup
Set these environment variables in your Vercel project:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `CLERK_SECRET_KEY` - Clerk authentication
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary for images
- `STRIPE_API_KEY` - Stripe payments
- `AUTH_SECRET` - NextAuth secret

## Deployment Process

### Automatic Deployment
1. Push to your Git repository
2. Vercel will automatically build and deploy
3. Prisma client will be generated using data proxy
4. Database operations will work through Vercel's infrastructure

### Local Development
Use the `build:local` script:
```bash
cd admin
npm run build:local
```

This will:
1. Push database schema to your local database
2. Generate Prisma client
3. Build the Next.js application

## Troubleshooting

### P1001 Error (Local)
If you still get P1001 errors locally:
1. Check your `DATABASE_URL` in `.env`
2. Use the hardcoded connection test file to verify connectivity
3. Consider using a VPN if your ISP is blocking the connection

### Vercel Build Issues
1. Ensure all environment variables are set in Vercel dashboard
2. Check that your database allows connections from Vercel's IP ranges
3. Verify Prisma schema is valid

### Database Migrations
For production database migrations:
1. Run `npx prisma migrate deploy` in Vercel environment
2. Or use Vercel's build hooks to run migrations automatically

## File Structure Changes

### Added Files
- `vercel.json` - Vercel configuration
- `admin/.vercelignore` - Vercel ignore rules
- `admin/lib/prisma-vercel.js` - Vercel-compatible Prisma client
- `admin/lib/db.ts` - Database utility
- `admin/scripts/vercel-build.sh` - Build script for Vercel

### Modified Files
- `admin/package.json` - Updated build scripts
- `admin/prisma/schema.prisma` - Added data proxy configuration
- `.gitignore` - Enhanced ignore rules

## Next Steps

1. Set up your Vercel project
2. Configure environment variables
3. Push your code to trigger deployment
4. Test the application in the Vercel environment

The data proxy configuration ensures that Prisma operations work through Vercel's infrastructure, bypassing local network restrictions.
