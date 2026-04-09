#!/bin/bash

# Vercel build script for admin app
echo "Starting Vercel build process..."

# Generate Prisma client without engine (for data proxy)
echo "Generating Prisma client..."
npx prisma generate --no-engine

# Build Next.js app
echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"
