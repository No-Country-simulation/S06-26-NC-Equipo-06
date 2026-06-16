import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === 'production',
    max: parseInt(process.env.DB_POOL_MAX ?? '30'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT ?? '5000'),
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT ?? '10000'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT ?? '30000'),
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const verifyDbConnection = async (): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("DB conectada correctamente");
  } catch (error) {
    console.error("DB no disponible:", error);
  }
};
