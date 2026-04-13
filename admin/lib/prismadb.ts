import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
};

const prismadb = globalThis.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    // Connection timeout to prevent hanging on slow database
    transactionTimeout: 10000, // 10 second transaction timeout
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prismadb;

export default prismadb;