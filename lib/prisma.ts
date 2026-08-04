import { PrismaClient } from "@prisma/client";

// Evita recriar o PrismaClient a cada hot-reload em desenvolvimento
// (o Next.js recarrega módulos, mas mantém o global entre reloads).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
