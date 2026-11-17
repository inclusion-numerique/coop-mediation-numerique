import { PrismaClient } from '@app/web/generated/prisma/client'
import { createEnumArrayTypeParser } from '@app/web/prisma/enumArrayTypeParser'
import { timestampExtension } from '@app/web/prisma/timestampExtension'
import { PrismaPg } from '@prisma/adapter-pg'

const debugLog = process.env.PRISMA_ENABLE_LOGGING === '1'

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg(
      { connectionString: process.env.DATABASE_URL },
      { userDefinedTypeParser: createEnumArrayTypeParser() },
    ),
    log: debugLog
      ? [
          {
            emit: 'stdout',
            level: 'query',
          },
          {
            emit: 'stdout',
            level: 'error',
          },
          {
            emit: 'stdout',
            level: 'info',
          },
          {
            emit: 'stdout',
            level: 'warn',
          },
        ]
      : undefined,
  }).$extends(timestampExtension)

// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = global as unknown as {
  prismaClient: ReturnType<typeof createPrismaClient> | undefined
}

export const extendedPrismaClient =
  globalForPrisma.prismaClient ?? createPrismaClient()

// `timestampExtension` n'ajoute qu'un hook `query` (aucune méthode/type supplémentaire sur le
// client) : la surface de type reste identique à `PrismaClient`. On conserve donc ce type pour
// l'export afin de ne pas propager le type du client étendu à toutes les signatures
// consommatrices (`tx: Prisma.TransactionClient`, etc.) ; le hook s'exécute bien au runtime.
export const prismaClient = extendedPrismaClient as unknown as PrismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaClient = extendedPrismaClient
}
