import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient | undefined }

const prisma = globalForPrisma.prisma || new PrismaClient()

//@ts-ignore
if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma
}

export const db = prisma